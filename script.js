/**
 * Navratri 2026 - Live Aarti Schedule Controller
 * Society: Ghanshyamnagar Tenament, Ghodasar - 380050
 *
 * ES Module with vanilla JavaScript, Firebase Modular CDN, and local fallbacks.
 */

import { 
  SOCIETY_INFO, 
  HOUSES, 
  HOUSE_CONTACTS, 
  SCHEDULE, 
  buildWhatsAppMessage, 
  extractPhoneNumbers,
  getHouseContacts,
  saveHouseContacts,
  formatPhoneDisplay 
} from "./data.js";
import { firebaseConfig, FIRESTORE_SETTINGS, COMMITTEE_CONFIG } from "./firebase-config.js";

// Official Firebase CDN Modular imports (ES Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  runTransaction, 
  setDoc,
  getDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* --- Application State --- */
const STATE = {
  // Current assignments for day1..day9 (e.g. { day1: "C-284", day2: null, ... })
  assignments: {
    day1: null, day2: null, day3: null,
    day4: null, day5: null, day6: null,
    day7: null, day8: null, day9: null
  },
  lastAssignments: {},
  isFirebaseActive: false,
  isOffline: !navigator.onLine,
  isCommitteeUnlocked: sessionStorage.getItem(COMMITTEE_CONFIG.sessionKey) === "true",
  pendingAction: null, // Holds { type, dayNum, houseNo } waiting for PIN verification
  activeDropdownDay: null, // Day number of currently open custom dropdown
  db: null
};

const LOCAL_STORAGE_KEY = "ghanshyamnagar_navratri_2026_assignments";
const THEME_STORAGE_KEY = "ghanshyamnagar_theme_preference";

/* --- DOM Element References --- */
const DOM = {
  tbody: document.getElementById("schedule-tbody"),
  liveStatusBadge: document.getElementById("live-status-badge"),
  liveStatusText: document.getElementById("live-status-text"),
  liveDot: document.querySelector(".live-dot"),
  themeToggleBtn: document.getElementById("theme-toggle-btn"),
  themeIcon: document.getElementById("theme-icon"),
  sharePageBtn: document.getElementById("share-page-btn"),
  printPageBtn: document.getElementById("print-page-btn"),
  resetAllBtn: document.getElementById("reset-all-btn"),
  societyLogoImg: document.getElementById("society-logo-img"),
  svgLogoFallback: document.getElementById("svg-logo-fallback"),
  // Countdown elements
  countDays: document.getElementById("count-days"),
  countHours: document.getElementById("count-hours"),
  countMins: document.getElementById("count-mins"),
  countSecs: document.getElementById("count-secs"),
  countdownCard: document.getElementById("event-countdown-card"),
  countdownHeader: document.getElementById("countdown-header-text"),
  countdownGrid: document.getElementById("countdown-timer-grid"),
  todayBanner: document.getElementById("today-aarti-banner"),
  todayBannerText: document.getElementById("today-banner-text"),
  // Reset Confirmation Dialog
  resetModal: document.getElementById("reset-confirm-modal"),
  resetConfirmBtn: document.getElementById("reset-confirm-btn"),
  resetCancelBtn: document.getElementById("reset-cancel-btn"),
  resetCloseBtn: document.getElementById("reset-modal-close"),
  toastContainer: document.getElementById("toast-container")
};

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initLogoFallback();
  initHeaderToolbar();
  initModals();
  loadCachedAssignments();
  renderSchedule();
  startCountdownTimer();
  initFirebase();
  initGlobalClickHandlers();
});

/* ==========================================================================
   FIREBASE & LIVE DATA SYNCHRONIZATION
   ========================================================================== */
function initFirebase() {
  const isPlaceholderConfig = 
    !firebaseConfig.apiKey || 
    firebaseConfig.apiKey.includes("YOUR_API_KEY") ||
    !firebaseConfig.projectId ||
    firebaseConfig.projectId.includes("your-project-id");

  if (isPlaceholderConfig) {
    console.info("ℹ️ Running in Demo Mode with LocalStorage.");
    updateLiveIndicator("demo");
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    STATE.db = getFirestore(app);
    STATE.isFirebaseActive = true;
    updateLiveIndicator("syncing");

    const docRef = doc(STATE.db, FIRESTORE_SETTINGS.collectionName, FIRESTORE_SETTINGS.documentId);

    // Listen to real-time changes across all connected devices
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        handleRemoteDataUpdate(remoteData);
        updateLiveIndicator("live");
      } else {
        // Document does not exist yet: create initial blank template
        const initialTemplate = {};
        for (let i = 1; i <= 9; i++) {
          initialTemplate[`day${i}`] = null;
        }
        setDoc(docRef, initialTemplate)
          .then(() => {
            updateLiveIndicator("live");
          })
          .catch((err) => {
            console.warn("Could not create initial Firestore doc:", err);
            updateLiveIndicator("demo");
          });
      }
    }, (error) => {
      console.warn("Firestore snapshot error (falling back to cache):", error);
      updateLiveIndicator("offline");
    });

  } catch (error) {
    console.warn("Firebase initialization failed. Using LocalStorage fallback:", error);
    updateLiveIndicator("demo");
  }
}

/**
 * Update UI live status pill
 */
function updateLiveIndicator(status) {
  if (status === "live") {
    DOM.liveDot.className = "live-dot";
    DOM.liveStatusText.textContent = "Live Synced (સક્રિય સર્વર)";
    DOM.liveStatusBadge.title = "Connected to Firebase Firestore. Live real-time sync active.";
  } else if (status === "syncing") {
    DOM.liveDot.className = "live-dot syncing";
    DOM.liveStatusText.textContent = "Connecting (જોડાઈ રહ્યું છે...)";
  } else if (status === "offline") {
    DOM.liveDot.className = "live-dot offline";
    DOM.liveStatusText.textContent = "Offline (કેશ્ડ ડેટા)";
    DOM.liveStatusBadge.title = "Offline or disconnected. Displaying cached local assignments.";
  } else {
    DOM.liveDot.className = "live-dot syncing";
    DOM.liveStatusText.textContent = "Demo Mode (LocalStorage)";
    DOM.liveStatusBadge.title = "Demo Mode: Storing in LocalStorage.";
  }
}

/**
 * Handle remote data changes and animate changed rows
 */
function handleRemoteDataUpdate(remoteData) {
  const previous = { ...STATE.assignments };
  const changedDays = [];

  for (let i = 1; i <= 9; i++) {
    const key = `day${i}`;
    const newVal = remoteData[key] || null;
    if (previous[key] !== newVal) {
      changedDays.push(i);
    }
    STATE.assignments[key] = newVal;
  }

  saveAssignmentsToCache();
  renderSchedule();

  // Highlight rows that changed in real time
  changedDays.forEach(dayNum => {
    const rowEl = document.querySelector(`[data-day-row="${dayNum}"]`);
    if (rowEl) {
      rowEl.classList.remove("row-flash-update");
      void rowEl.offsetWidth; // Force CSS reflow
      rowEl.classList.add("row-flash-update");
    }
  });
}

/**
 * Cache assignments to LocalStorage
 */
function saveAssignmentsToCache() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(STATE.assignments));
  } catch (e) {
    console.warn("LocalStorage save error:", e);
  }
}

/**
 * Load cached assignments from LocalStorage
 */
function loadCachedAssignments() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      for (let i = 1; i <= 9; i++) {
        STATE.assignments[`day${i}`] = parsed[`day${i}`] || null;
      }
    }
  } catch (e) {
    console.warn("LocalStorage read error:", e);
  }
}

/* ==========================================================================
   TRANSACTIONAL SAVE / EDIT WITH CONCURRENCY PROTECTION
   ========================================================================== */
async function performHouseAssignment(dayNum, houseNo) {
  if (STATE.isFirebaseActive && STATE.db) {
    try {
      showToast(`Saving ${houseNo || 'clear'} for Day ${dayNum}...`, "info");
      const docRef = doc(STATE.db, FIRESTORE_SETTINGS.collectionName, FIRESTORE_SETTINGS.documentId);

      await runTransaction(STATE.db, async (transaction) => {
        const snap = await transaction.get(docRef);
        const currentData = snap.exists() ? snap.data() : {};

        if (houseNo !== null) {
          for (let d = 1; d <= 9; d++) {
            if (d !== dayNum && currentData[`day${d}`] === houseNo) {
              const conflictDay = SCHEDULE.find(s => s.dayNum === d);
              throw new Error(`House ${houseNo} was just picked for Day ${d} (${conflictDay ? conflictDay.norata : ''})!`);
            }
          }
        }

        transaction.set(docRef, {
          ...currentData,
          [`day${dayNum}`]: houseNo
        }, { merge: true });
      });

      if (houseNo) {
        showToast(`✅ મકાન નં. ${houseNo} દિવસ ${dayNum} માટે સફળતાપૂર્વક ફાળવાયું!`, "success");
      } else {
        showToast(`દિવસ ${dayNum} ની ફાળવણી રદ કરવામાં આવી.`, "info");
      }

    } catch (err) {
      console.error("Assignment transaction error:", err);
      showToast(`⚠️ ${err.message}`, "error");
      renderSchedule();
    }
  } else {
    if (houseNo !== null) {
      for (let d = 1; d <= 9; d++) {
        if (d !== dayNum && STATE.assignments[`day${d}`] === houseNo) {
          showToast(`⚠️ House ${houseNo} is already assigned to Day ${d}!`, "error");
          return;
        }
      }
    }

    STATE.assignments[`day${dayNum}`] = houseNo;
    saveAssignmentsToCache();
    renderSchedule();

    if (houseNo) {
      showToast(`✅ મકાન નં. ${houseNo} દિવસ ${dayNum} માટે પસંદ થયું!`, "success");
    } else {
      showToast(`દિવસ ${dayNum} ની પસંદગી ખાલી કરવામાં આવી.`, "info");
    }
  }
}

async function performResetAll() {
  if (COMMITTEE_CONFIG.requirePinForEdits && !STATE.isCommitteeUnlocked) {
    requestCommitteePin({ type: "reset" });
    return;
  }

  if (STATE.isFirebaseActive && STATE.db) {
    try {
      const docRef = doc(STATE.db, FIRESTORE_SETTINGS.collectionName, FIRESTORE_SETTINGS.documentId);
      await runTransaction(STATE.db, async (transaction) => {
        const clearedData = {};
        for (let i = 1; i <= 9; i++) {
          clearedData[`day${i}`] = null;
        }
        transaction.set(docRef, clearedData);
      });
      showToast("સર્વ ૯ દિવસના મકાન નંબરો રીસેટ કરવામાં આવ્યા.", "info");
    } catch (err) {
      console.error("Reset transaction error:", err);
      showToast(`⚠️ રીસેટ કરવામાં ભૂલ: ${err.message}`, "error");
    }
  } else {
    for (let i = 1; i <= 9; i++) {
      STATE.assignments[`day${i}`] = null;
    }
    saveAssignmentsToCache();
    renderSchedule();
    showToast("તમામ ફાળવણી રીસેટ થઈ ગઈ છે.", "info");
  }
}

/* ==========================================================================
   SCHEDULE TABLE RENDERING & ACCESSIBLE DROPDOWN
   ========================================================================== */
function renderSchedule() {
  const currentAssignedHouses = new Map();
  for (let i = 1; i <= 9; i++) {
    const h = STATE.assignments[`day${i}`];
    if (h) currentAssignedHouses.set(h, i);
  }

  const todayIso = getTodayIsoDate();

  DOM.tbody.innerHTML = "";

  SCHEDULE.forEach((day) => {
    const isToday = day.isoDate === todayIso;
    const assignedHouse = STATE.assignments[`day${day.dayNum}`];

    const tr = document.createElement("tr");
    tr.setAttribute("data-day-row", day.dayNum);
    if (isToday) tr.classList.add("highlight-today");

    // 1. Sr. No. Cell
    const tdSr = document.createElement("td");
    tdSr.className = "cell-sr";
    tdSr.setAttribute("data-label", "Sr. No.");
    tdSr.textContent = day.dayNum;

    // 2. Date Cell
    const tdDate = document.createElement("td");
    tdDate.className = "cell-date";
    tdDate.setAttribute("data-label", "Date");
    tdDate.innerHTML = `${day.dateStr} ${isToday ? '<span class="today-tag" title="આજની આરતી (Today)">⭐</span>' : ''}`;

    // 3. Day Cell
    const tdDay = document.createElement("td");
    tdDay.className = "cell-day";
    tdDay.setAttribute("data-label", "Day");
    tdDay.textContent = day.dayName;

    // 4. Norata Cell (First Noratu, Second Noratu... with Gujarati name, protected from auto-translation)
    const tdNorata = document.createElement("td");
    tdNorata.className = "cell-norata notranslate";
    tdNorata.setAttribute("data-label", "Norata");
    tdNorata.setAttribute("translate", "no");
    tdNorata.innerHTML = `
      <div class="norata-box">
        <span class="norata-en-text">${day.norataEn}</span>
        <span class="norata-gu-text">(${day.norataGu})</span>
      </div>
    `;

    // 5. House No. Cell (The widest column)
    const tdHouse = document.createElement("td");
    tdHouse.className = "col-house-cell";
    tdHouse.setAttribute("data-label", "House No.");

    const wrapper = document.createElement("div");
    wrapper.className = "house-cell-wrapper";

    if (assignedHouse) {
      const badge = createAssignedBadge(day.dayNum, assignedHouse);
      const waBtn = createWhatsAppButton(day.dayNum, assignedHouse);
      wrapper.appendChild(badge);
      wrapper.appendChild(waBtn);
    } else {
      const customSelect = createCustomDropdown(day.dayNum, currentAssignedHouses);
      wrapper.appendChild(customSelect);
    }

    tdHouse.appendChild(wrapper);

    tr.appendChild(tdSr);
    tr.appendChild(tdDate);
    tr.appendChild(tdDay);
    tr.appendChild(tdNorata);
    tr.appendChild(tdHouse);

    DOM.tbody.appendChild(tr);
  });
}

function createAssignedBadge(dayNum, houseNo) {
  const badgeContainer = document.createElement("div");
  badgeContainer.className = "assigned-house-badge";

  const houseText = document.createElement("span");
  houseText.className = "house-number-text";
  houseText.innerHTML = `🏠 ${houseNo}`;

  const actions = document.createElement("div");
  actions.className = "badge-actions";

  const changeBtn = document.createElement("button");
  changeBtn.type = "button";
  changeBtn.className = "badge-btn btn-change";
  changeBtn.title = "Change house assignment";
  changeBtn.setAttribute("aria-label", `Change assignment for Day ${dayNum}`);
  changeBtn.innerHTML = `✏️ Change`;
  changeBtn.addEventListener("click", () => {
    performHouseAssignment(dayNum, null);
  });

  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "badge-btn btn-clear";
  clearBtn.title = "Clear assignment";
  clearBtn.setAttribute("aria-label", `Clear assignment for Day ${dayNum}`);
  clearBtn.innerHTML = `✕`;
  clearBtn.addEventListener("click", () => {
    performHouseAssignment(dayNum, null);
  });

  actions.appendChild(changeBtn);
  actions.appendChild(clearBtn);

  badgeContainer.appendChild(houseText);
  badgeContainer.appendChild(actions);
  return badgeContainer;
}

/**
 * Universal safe WhatsApp redirect that works on desktop, mobile, and handles pop-up blockers
 */
function openWhatsAppUrl(url) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = url;
  } else {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win || win.closed || typeof win.closed === "undefined") {
      window.location.href = url;
    }
  }
}

/**
 * Sends a WhatsApp Aarti reminder directly to the WhatsApp Number linked with House No. in data.js.
 * Zero pop-ups!
 */
function sendWhatsAppToHouse(dayNum, houseNo) {
  if (!houseNo) return;
  const rawContact = HOUSE_CONTACTS[houseNo];
  const phones = extractPhoneNumbers(rawContact);
  const message = buildWhatsAppMessage(dayNum, houseNo);

  if (phones.length > 0) {
    const primaryPhone = phones[0];
    const waUrl = `https://api.whatsapp.com/send?phone=${primaryPhone}&text=${encodeURIComponent(message)}`;
    showToast(`🚀 મકાન નં. ${houseNo} (+${primaryPhone}) માટે WhatsApp ખૂલી રહ્યું છે...`, "success");
    openWhatsAppUrl(waUrl);

    // If house has 2 phone numbers in data.js, provide quick floating trigger for number 2 without popup
    if (phones.length > 1) {
      const secondPhone = phones[1];
      const waUrl2 = `https://api.whatsapp.com/send?phone=${secondPhone}&text=${encodeURIComponent(message)}`;
      setTimeout(() => {
        showToast(`📲 નંબર ૨ (+${secondPhone}) પર પણ મોકલવા અહીં ક્લિક કરો`, "info");
        const quickBtn = document.createElement("button");
        quickBtn.className = "btn btn-whatsapp";
        quickBtn.style.position = "fixed";
        quickBtn.style.bottom = "80px";
        quickBtn.style.right = "20px";
        quickBtn.style.zIndex = "9999";
        quickBtn.style.boxShadow = "0 6px 20px rgba(0,0,0,0.5)";
        quickBtn.innerHTML = `📱 નંબર ૨ પર પણ મોકલો (+${secondPhone}) 🚀`;
        quickBtn.onclick = () => {
          openWhatsAppUrl(waUrl2);
          quickBtn.remove();
        };
        document.body.appendChild(quickBtn);
        setTimeout(() => quickBtn.remove(), 12000);
      }, 1200);
    }
  } else {
    // If placeholder like 91XXXXXXXXXX or no digits in data.js, open universal WhatsApp URL with message so user can choose contact
    const universalUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    showToast(`WhatsApp ખૂલી રહ્યું છે (સંપર્ક પસંદ કરો)...`, "info");
    openWhatsAppUrl(universalUrl);
  }
}

function createWhatsAppButton(dayNum, houseNo) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "wa-reminder-btn";
  btn.setAttribute("aria-label", `Send WhatsApp reminder to ${houseNo}`);
  btn.innerHTML = `<span>💬</span> <span>WhatsApp Reminder</span>`;

  btn.addEventListener("click", () => {
    sendWhatsAppToHouse(dayNum, houseNo);
  });

  return btn;
}

function selectHouseAndSendWhatsApp(dayNum, houseNo) {
  // 1. Immediately assign house to that day (syncs with Firestore)
  performHouseAssignment(dayNum, houseNo);

  // 2. Immediately send WhatsApp message to the number linked in data.js
  if (houseNo) {
    sendWhatsAppToHouse(dayNum, houseNo);
  }
}

function createCustomDropdown(dayNum, assignedHousesMap) {
  const container = document.createElement("div");
  container.className = "custom-select-container";
  container.id = `select-container-${dayNum}`;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "custom-select-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-label", `Select House for Day ${dayNum}`);
  trigger.innerHTML = `
    <span>Select House (મકાન પસંદ કરો)</span>
    <span class="chevron-icon" aria-hidden="true">▼</span>
  `;

  const menu = document.createElement("div");
  menu.className = "custom-select-menu";
  menu.setAttribute("role", "listbox");
  menu.setAttribute("tabindex", "-1");

  HOUSES.forEach((house) => {
    const option = document.createElement("div");
    option.className = "custom-select-option";
    option.setAttribute("role", "option");
    option.setAttribute("data-house", house);
    option.setAttribute("tabindex", "0");

    const isTakenByOtherDay = assignedHousesMap.has(house) && assignedHousesMap.get(house) !== dayNum;

    if (isTakenByOtherDay) {
      const takenDayNum = assignedHousesMap.get(house);
      option.classList.add("disabled");
      option.setAttribute("aria-disabled", "true");
      option.innerHTML = `
        <span>${house}</span>
        <span class="taken-tag">Day ${takenDayNum} (ફાળવાયેલ)</span>
      `;
    } else {
      option.innerHTML = `
        <span>${house}</span>
        <span class="avail-tag">✓</span>
      `;

      option.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllDropdowns();
        selectHouseAndSendWhatsApp(dayNum, house);
      });

      option.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          closeAllDropdowns();
          selectHouseAndSendWhatsApp(dayNum, house);
        }
      });
    }

    menu.appendChild(option);
  });

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = container.classList.contains("open");
    closeAllDropdowns();
    if (!isOpen) {
      container.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
      STATE.activeDropdownDay = dayNum;

      const firstEnabled = menu.querySelector(".custom-select-option:not(.disabled)");
      if (firstEnabled) firstEnabled.focus();
    }
  });

  container.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllDropdowns();
      trigger.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveFocusInMenu(menu, 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveFocusInMenu(menu, -1);
    }
  });

  container.appendChild(trigger);
  container.appendChild(menu);
  return container;
}

function moveFocusInMenu(menu, direction) {
  const options = Array.from(menu.querySelectorAll(".custom-select-option:not(.disabled)"));
  if (options.length === 0) return;
  const currentIdx = options.indexOf(document.activeElement);
  let nextIdx = currentIdx + direction;
  if (nextIdx < 0) nextIdx = options.length - 1;
  if (nextIdx >= options.length) nextIdx = 0;
  options[nextIdx].focus();
}

function closeAllDropdowns() {
  document.querySelectorAll(".custom-select-container.open").forEach((el) => {
    el.classList.remove("open");
    const trig = el.querySelector(".custom-select-trigger");
    if (trig) trig.setAttribute("aria-expanded", "false");
  });
  STATE.activeDropdownDay = null;
}

function initGlobalClickHandlers() {
  document.addEventListener("click", () => {
    closeAllDropdowns();
  });
}



/* ==========================================================================
   COUNTDOWN TIMER & TODAY'S AARTI HIGHLIGHT
   ========================================================================== */
function startCountdownTimer() {
  const navratriStartDate = new Date("2026-10-11T20:00:00+05:30").getTime();
  const navratriEndDate = new Date("2026-10-19T23:59:59+05:30").getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distanceToStart = navratriStartDate - now;
    const distanceToEnd = navratriEndDate - now;

    if (distanceToStart > 0) {
      const days = Math.floor(distanceToStart / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distanceToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distanceToStart % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distanceToStart % (1000 * 60)) / 1000);

      DOM.countDays.textContent = String(days).padStart(2, "0");
      DOM.countHours.textContent = String(hours).padStart(2, "0");
      DOM.countMins.textContent = String(minutes).padStart(2, "0");
      DOM.countSecs.textContent = String(seconds).padStart(2, "0");

      DOM.countdownGrid.classList.remove("hidden");
      DOM.todayBanner.classList.add("hidden");
      DOM.countdownHeader.textContent = "⏳ Navratri 2026 Countdown (નવરાત્રી પ્રારંભ)";

    } else if (distanceToEnd > 0) {
      DOM.countdownGrid.classList.add("hidden");
      DOM.todayBanner.classList.remove("hidden");

      const todayIso = getTodayIsoDate();
      const currentDay = SCHEDULE.find(d => d.isoDate === todayIso);

      if (currentDay) {
        DOM.countdownHeader.textContent = "🔥 નવરાત્રી ૨૦૨૬ મહાપર્વ ચાલુ છે!";
        DOM.todayBannerText.textContent = `આજની પાવન આરતી: ${currentDay.norata} (${currentDay.dateStr}) - 8:00 PM!`;
      } else {
        DOM.countdownHeader.textContent = "🔥 જય માતાજી - નવરાત્રી ૨૦૨૬ મહોત્સવ!";
      }

    } else {
      DOM.countdownGrid.classList.add("hidden");
      DOM.todayBanner.classList.remove("hidden");
      DOM.countdownHeader.textContent = "🌸 નવરાત્રી ૨૦૨૬ મહોત્સવ સંપન્ન";
      DOM.todayBannerText.textContent = "તમામ સોસાયટીજનોનો ખૂબ ખૂબ આભાર | જય માતાજી!";
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

function getTodayIsoDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/* ==========================================================================
   THEME, SHARING, LOGO FALLBACK & TOOLBAR
   ========================================================================== */
function initTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeIcon(saved);
}

function updateThemeIcon(theme) {
  DOM.themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_STORAGE_KEY, next);
  updateThemeIcon(next);
}

function initLogoFallback() {
  DOM.societyLogoImg.addEventListener("error", () => {
    DOM.societyLogoImg.classList.add("hidden");
    DOM.svgLogoFallback.classList.remove("hidden");
  });
}

function initHeaderToolbar() {
  DOM.themeToggleBtn.addEventListener("click", toggleTheme);

  DOM.sharePageBtn.addEventListener("click", () => {
    const shareData = {
      title: `${SOCIETY_INFO.name} - ${SOCIETY_INFO.eventTitle}`,
      text: `${SOCIETY_INFO.fullTitle} ની નવરાત્રી ૨૦૨૬ આરતી ફાળવણી અને સમયપત્રક:`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => showToast("🔗 કાર્યક્રમ લિંક કોપી થઈ ગઈ છે! (Link copied to clipboard)", "success"))
        .catch(() => showToast("🔗 લિંક કોપી કરી શકાઈ નથી.", "error"));
    }
  });

  DOM.printPageBtn.addEventListener("click", () => {
    window.print();
  });

  DOM.resetAllBtn.addEventListener("click", () => {
    DOM.resetModal.showModal();
  });
}

function initModals() {
  DOM.resetConfirmBtn.addEventListener("click", () => {
    DOM.resetModal.close();
    performResetAll();
  });
  DOM.resetCancelBtn.addEventListener("click", () => DOM.resetModal.close());
  DOM.resetCloseBtn.addEventListener("click", () => DOM.resetModal.close());
}

/* ==========================================================================
   TOAST NOTIFICATIONS
   ========================================================================== */
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "alert");

  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "⚠️";

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(15px)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
