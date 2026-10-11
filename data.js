/**
 * Navratri 2026 - Schedule & Society Configuration Data
 * Society: Ghanshyamnagar Tenament, Ghodasar - 380050
 *
 * This file contains the 9-day Aarti schedule, list of member houses (C-279 to C-294),
 * contact WhatsApp numbers (supports 1 or 2 numbers per house), daily Navratri quotes,
 * and message templates.
 */

export const SOCIETY_INFO = {
  name: "Ghanshyamnagar Tenament",
  address: "Ghodasar, Ahmedabad - 380050",
  fullTitle: "Ghanshyamnagar Tenament, Ghodasar - 380050",
  eventTitle: "Navratri 2026 - Aarti Schedule",
  eventGujarati: "નવરાત્રી ૨૦૨૬ - આરતી મહોત્સવ",
  aartiTime: "8:00 PM onwards",
  aartiTimeGujarati: "સાંજે ૮:૦૦ વાગ્યાથી",
  venue: "Society Chowk / Garbi Mandal",
  venueGujarati: "સોસાયટી ચોક / ગરબી મંડળ"
};

/**
 * 16 Society houses: C-279 through C-294
 */
export const HOUSES = [
  "C-279", "C-280", "C-281", "C-282",
  "C-283", "C-284", "C-285", "C-286",
  "C-287", "C-288", "C-289", "C-290",
  "C-291", "C-292", "C-293", "C-294"
];

/**
 * WhatsApp Contact numbers mapping for each house number.
 * Supports:
 * - Single number: "919825012345" or "9825012345"
 * - 2 phone numbers: "9825012345 / 9898012345" or "9825012345, 9898012345"
 * - Or Array format: ["9825012345", "9898012345"]
 *
 * (10-digit numbers automatically get prefixed with India country code 91)
 */
export const HOUSE_CONTACTS = {
  "C-279": "919723302459",
  "C-280": "919687497024",
  "C-281": "919408145834",
  "C-282": ["917990254394", "919427958119"],
  "C-283": ["918128197789", "917600082467"],
  "C-284": ["919924014723", "919586971399"],
  "C-285": ["918905819029", "919327060712"],
  "C-286": "919974847363",
  "C-287": "919824057465",
  "C-288": ["919824656188", "919426631668"],
  "C-289": ["919898944337", "919033022061", "917567704665"],
  "C-290": "919913648520",
  "C-291": "919879038348",
  "C-292": "919512662229",
  "C-293": "917069908394",
  "C-294": "919328235675"
};

/**
 * LocalStorage key for storing user-entered contacts
 */
const CONTACTS_STORAGE_KEY = "ghanshyamnagar_house_contacts_v2";

/**
 * Load saved contacts from localStorage into in-memory HOUSE_CONTACTS cache
 */
export function getSavedHouseContacts() {
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Get contacts for a specific house (checks localStorage, then defaults)
 */
export function getHouseContacts(houseNo) {
  const saved = getSavedHouseContacts();
  if (saved[houseNo] && !String(saved[houseNo]).toUpperCase().includes("X")) {
    return saved[houseNo];
  }
  return HOUSE_CONTACTS[houseNo] || "";
}

/**
 * Save contacts for a house to localStorage
 */
export function saveHouseContacts(houseNo, phoneData) {
  try {
    const saved = getSavedHouseContacts();
    saved[houseNo] = phoneData;
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(saved));
  } catch (e) {
    console.warn("Could not save contact to localStorage:", e);
  }
}

/**
 * Format a phone number cleanly for UI display, e.g. 919825012345 -> +91 98250 12345
 */
export function formatPhoneDisplay(phone) {
  if (!phone) return "";
  const cleaned = String(phone).replace(/[^0-9]/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    const sub = cleaned.slice(2);
    return `+91 ${sub.slice(0, 5)} ${sub.slice(5)}`;
  }
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return `+${cleaned}`;
}

/**
 * Helper to safely extract all individual valid phone numbers for a house
 * @param {string|string[]} rawContact 
 * @returns {string[]} Array of clean, 12-digit international numbers (e.g. ["919825012345", "919898012345"])
 */
export function extractPhoneNumbers(rawContact) {
  if (!rawContact) return [];
  
  const rawList = Array.isArray(rawContact)
    ? rawContact
    : String(rawContact).split(/[,/|;\n]+/);

  const cleanList = [];

  for (const item of rawList) {
    if (!item) continue;
    const trimmed = String(item).trim();
    if (trimmed.toUpperCase().includes("X")) continue;

    let digits = trimmed.replace(/[^0-9]/g, "");
    if (!digits) continue;

    if (digits.length === 10) {
      digits = "91" + digits;
    }

    if (digits.length >= 10 && digits.length <= 15) {
      if (!cleanList.includes(digits)) {
        cleanList.push(digits);
      }
    }
  }

  return cleanList;
}

/**
 * 9 Days of Navratri 2026 Schedule
 * Clear, accurate Norata names: First Noratu (પહેલું નોરતું) to Ninth Noratu (નવમું નોરતું)
 */
export const SCHEDULE = [
  {
    dayNum: 1,
    dateStr: "11 Oct 2026",
    isoDate: "2026-10-11",
    dayName: "Sunday (રવિવાર)",
    dayNameGujarati: "રવિવાર",
    norataEn: "First Noratu",
    norataGu: "પહેલું નોરતું",
    norata: "First Noratu (પહેલું નોરતું)",
    quote: {
      gujarati: "મા શૈલપુત્રી આપના પરિવારમાં સુખ, શાંતિ અને અખંડ સમૃદ્ધિનું આગમન કરાવે.",
      english: "May Maa Shailputri bless your home with strength, peace, and auspicious new beginnings."
    }
  },
  {
    dayNum: 2,
    dateStr: "12 Oct 2026",
    isoDate: "2026-10-12",
    dayName: "Monday (સોમવાર)",
    dayNameGujarati: "સોમવાર",
    norataEn: "Second Noratu",
    norataGu: "બીજું નોરતું",
    norata: "Second Noratu (બીજું નોરતું)",
    quote: {
      gujarati: "તપ અને સંયમની પ્રતીક મા બ્રહ્મચારિણી સદૈવ આપના જીવનપંથને દિવ્ય પ્રકાશથી ઉજાળે.",
      english: "May Maa Brahmacharini guide your family on the path of devotion, harmony, and virtue."
    }
  },
  {
    dayNum: 3,
    dateStr: "13 Oct 2026",
    isoDate: "2026-10-13",
    dayName: "Tuesday (મંગળવાર)",
    dayNameGujarati: "મંગળવાર",
    norataEn: "Third Noratu",
    norataGu: "ત્રીજું નોરતું",
    norata: "Third Noratu (ત્રીજું નોરતું)",
    quote: {
      gujarati: "મા ચંદ્રઘંટાના આશીર્વાદથી સર્વ સંકટો દૂર થાય અને આપના આંગણે સદાય સૌભાગ્ય પથરાય.",
      english: "May Maa Chandraghanta eliminate all fears and bestow courage, grace, and serenity."
    }
  },
  {
    dayNum: 4,
    dateStr: "14 Oct 2026",
    isoDate: "2026-10-14",
    dayName: "Wednesday (બુધવાર)",
    dayNameGujarati: "બુધવાર",
    norataEn: "Fourth Noratu",
    norataGu: "ચોથું નોરતું",
    norata: "Fourth Noratu (ચોથું નોરતું)",
    quote: {
      gujarati: "બ્રહ્માંડ સર્જક મા કુષ્માંડા આપના પરિવારને નિરોગી કાયા અને અખૂટ ઉર્જા પ્રદાન કરે.",
      english: "May Maa Kushmanda illuminate your household with radiant health, joy, and divine energy."
    }
  },
  {
    dayNum: 5,
    dateStr: "15 Oct 2026",
    isoDate: "2026-10-15",
    dayName: "Thursday (ગુરુવાર)",
    dayNameGujarati: "ગુરુવાર",
    norataEn: "Fifth Noratu",
    norataGu: "પાંચમું નોરતું",
    norata: "Fifth Noratu (પાંચમું નોરતું)",
    quote: {
      gujarati: "વાત્સલ્યની મૂર્તિ મા સ્કંદમાતા આપના સંતાનો અને પરિવાર પર સદાય સ્નેહ અને કૃપા વરસાવે.",
      english: "May Maa Skandamata shower pure maternal love, safety, and prosperity upon your family."
    }
  },
  {
    dayNum: 6,
    dateStr: "16 Oct 2026",
    isoDate: "2026-10-16",
    dayName: "Friday (શુક્રવાર)",
    dayNameGujarati: "શુક્રવાર",
    norataEn: "Sixth Noratu",
    norataGu: "છઠ્ઠું નોરતું",
    norata: "Sixth Noratu (છઠ્ઠું નોરતું)",
    quote: {
      gujarati: "દુષ્ટ સંહારિણી મા કાત્યાયની આપને ધર્મ, સત્ય અને ઉન્નતિના પંથે વિજયી બનાવે.",
      english: "May Maa Katyayani grant unwavering confidence, righteousness, and victory in all endeavors."
    }
  },
  {
    dayNum: 7,
    dateStr: "17 Oct 2026",
    isoDate: "2026-10-17",
    dayName: "Saturday (શનિવાર)",
    dayNameGujarati: "શનિવાર",
    norataEn: "Seventh Noratu",
    norataGu: "સાતમું નોરતું",
    norata: "Seventh Noratu (સાતમું નોરતું)",
    quote: {
      gujarati: "કાળ અને ભયનું નિવારણ કરનારી મા કાલરાત્રિ આપના ઘરનું સદૈવ અદ્રશ્ય રક્ષણ કરે.",
      english: "May Maa Kalaratri dispel all darkness and shield your family in every adversity."
    }
  },
  {
    dayNum: 8,
    dateStr: "18 Oct 2026",
    isoDate: "2026-10-18",
    dayName: "Sunday (રવિવાર)",
    dayNameGujarati: "રવિવાર",
    norataEn: "Eighth Noratu",
    norataGu: "આઠમું નોરતું",
    norata: "Eighth Noratu (આઠમું નોરતું)",
    quote: {
      gujarati: "કરુણા અને પવિત્રતાની દેવી મા મહાગૌરી આપના સર્વ મનોરથ પૂર્ણ કરી પરમ શાંતિ આપે.",
      english: "May Maa Mahagauri fulfill all noble aspirations and purify life with serene bliss."
    }
  },
  {
    dayNum: 9,
    dateStr: "19 Oct 2026",
    isoDate: "2026-10-19",
    dayName: "Monday (સોમવાર)",
    dayNameGujarati: "સોમવાર",
    norataEn: "Ninth Noratu",
    norataGu: "નવમું નોરતું",
    norata: "Ninth Noratu (નવમું નોરતું)",
    quote: {
      gujarati: "સર્વ સિદ્ધિ અને સુખ આપનારી મા સિદ્ધિદાત્રી આપના ઘરમાં અખંડ આનંદ સ્થાપે.",
      english: "May Maa Siddhidatri bestow ultimate wisdom, divine accomplishment, and supreme joy."
    }
  }
];

/**
 * Helper to build the bilingual SMS reminder message
 * @param {number} dayNum 1-9
 * @param {string} houseNo e.g. "C-284"
 * @returns {string} Fully formatted message string
 */
export function buildSmsMessage(dayNum, houseNo) {
  const day = SCHEDULE.find(d => d.dayNum === dayNum);
  if (!day) return "";

  const dayOfWeekEn = day.dayName ? day.dayName.split(' ')[0] : '';
  const dayOfWeekGu = day.dayNameGujarati || (day.dayName ? day.dayName.replace(/^[^(]+\(|\)/g, '') : '');

  // English section (top)
  const englishSection =
    `Jai Mataji! 🙏\n` +
    `Navratri 2026 Aarti Invitation - House No. ${houseNo}\n` +
    `✨ Noratu: ${day.norataEn || day.norata}\n` +
    `📅 Date: ${day.dateStr} (${dayOfWeekEn})\n` +
    `⏰ Time: ${SOCIETY_INFO.aartiTime}\n` +
    `📍 Venue: ${SOCIETY_INFO.venue}\n` +
    `You and your family are cordially invited for the evening Aarti. 🪔`;

  // Gujarati section (below)
  const gujaratiSection =
    `જય માતાજી! 🙏\n` +
    `મકાન નં. ${houseNo} માટે આરતી વિગત:\n` +
    `✨ નોરતું: ${day.norataGu || day.norata}\n` +
    `📅 તારીખ: ${day.dateStr} [${dayOfWeekGu}]\n` +
    `⏰ સમય: ${SOCIETY_INFO.aartiTimeGujarati}\n` +
    `📍 સ્થળ: ${SOCIETY_INFO.venueGujarati}\n` +
    `આપ સર્વે પરિવાર સાથે સમયસર આરતીમાં પધારશો એવી નમ્ર વિનંતી. 🪔\n` +
    `— ${SOCIETY_INFO.name} સમિતિ`;

  return `${englishSection}\n\n------------------------\n\n${gujaratiSection}`;
}

// Backwards compatibility alias
export const buildWhatsAppMessage = buildSmsMessage;
