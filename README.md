# 🪔 Navratri 2026 - Aarti Schedule Website
**Ghanshyamnagar Tenament, Ghodasar - 380050**

A stunning, fully responsive, festive single-page application for managing the 9-day Navratri 2026 Aarti host schedule. Features real-time shared multi-user synchronization powered by Firebase Cloud Firestore, automated bilingual WhatsApp reminder dispatch, committee edit protection, printable schedules, and instant static hosting on GitHub Pages with zero build steps.

---

## 🌟 Key Features

- **🌸 Traditional Festive Aesthetics**: Deep royal maroon, saffron, radiant gold, and rani magenta themes with glassmorphism table cards, floating marigold petals, flickering diyas, and shimmering gold gradients.
- **⚡ Live Real-time Firestore Sync**: Instant zero-refresh updates using Firestore `onSnapshot`. When any resident or committee member selects or changes a house, all open browsers update instantaneously with an amber pulse animation.
- **🛡️ Concurrency & Race-Condition Safe**: Firestore transactions (`runTransaction`) prevent double-booking. If two people pick the same house at the same second, the transaction securely preserves the first selection and alerts the second user.
- **🏠 Accessible Custom House Dropdown**: Clean custom dropdown for houses **C-279 through C-294** (16 houses). Houses taken on other days appear greyed out and unselectable. Fully accessible via keyboard (Arrows, Enter, Escape) and touch-friendly (min 44px tap targets).
- **📱 1-Tap Bilingual WhatsApp Reminders**: Direct `https://wa.me/` integration generating a formatted Gujarati + English reminder message complete with Norata name, date, time (8:00 PM), venue, and 9 daily rotating Maa Durga quotes.
- **🔒 Committee PIN Protection**: Optional client-side PIN prompt (default: `2026`, stored as SHA-256 hash) to prevent accidental edits by viewers while allowing committee members to select, change, or reset.
- **📱 Mobile Stacked Cards**: Seamlessly transforms the table into responsive stacked cards below 640px, ensuring zero horizontal scrolling from 320px screens up to 4K displays.
- **🖨️ Printer & PDF Optimized**: Dedicated print stylesheet formatted cleanly for paper noticeboards.
- **🌓 Theme & Connectivity**: Light/Dark mode toggle, live connection indicator, offline caching with `localStorage`, and Web Share API support.

---

## 📁 Project Structure

```text
├── index.html            # Main semantic HTML document (Hero, Schedule, Modals, Footer)
├── style.css             # Glassmorphism, festive theme, animations, responsive cards & print styles
├── script.js             # ES Module: Live Firestore sync, transactions, dropdowns, WhatsApp & PIN
├── data.js               # Schedule (9 days), 16 houses, WhatsApp contacts, 9 Maa Durga quotes
├── firebase-config.js    # Firebase web configuration & Committee PIN settings
├── assets/
│   └── logo.png          # Circular emblem with glowing gold ring (with inline SVG fallback)
└── README.md             # Complete setup, deployment, security rules & customization guide
```

---

## 🚀 Step 1: Firebase Setup & Configuration

This project connects directly to Google Cloud Firestore via Firebase Modular CDN without needing Node.js build pipelines.

### 1. Create a Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g., `ghanshyamnagar-navratri-2026`) and click **Continue**.
4. Disable Google Analytics (optional, not needed for this project) and click **Create Project**.

### 2. Add a Web App
1. On your Firebase Project Overview page, click the **Web icon** (`</>`).
2. Enter an app nickname (e.g., `Navratri Web App`).
3. Leave "Firebase Hosting" unchecked (we are using GitHub Pages).
4. Click **Register app**.
5. Firebase will display your `firebaseConfig` object. Copy the values:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

### 3. Create Cloud Firestore Database
1. In the Firebase console left menu, click **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose your database location (select `asia-south1` Mumbai for fastest performance in Gujarat/India).
4. Select **Start in production mode** and click **Create**.

### 4. Paste Config into `firebase-config.js`
Open `firebase-config.js` in your editor and replace the placeholder object:
```javascript
export const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

> [!NOTE]
> **Are Firebase Config Keys Public Secrets?**  
> **No.** Firebase web configuration keys (`apiKey`, `projectId`, `appId`) are public identifiers designed to be included in client-side HTML/JavaScript. They do **not** grant administrative access. Your database is secured by **Firestore Security Rules** (configured in Step 2).

---

## 🛡️ Step 2: Publishing Firestore Security Rules

To ensure that only valid data is stored and that no malicious users can tamper with other collections or inject arbitrary fields, publish the following strict security rules.

1. In the Firebase Console, go to **Firestore Database** > **Rules** tab.
2. Replace all existing text with the following production rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Strict rules specifically for the Navratri 2026 Aarti assignments document
    match /navratri2026/assignments {
      
      // Allow public read access so all society residents can view the live schedule
      allow read: if true;
      
      // Restrict write operations strictly to expected fields and valid house numbers
      allow write: if 
        // 1. Only allow the 9 expected day fields (day1 to day9)
        request.resource.data.keys().hasOnly(['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7', 'day8', 'day9']) &&
        
        // 2. Validate that each field is either null or a valid house number matching C-279 to C-294
        isValidHouse(request.resource.data.day1) &&
        isValidHouse(request.resource.data.day2) &&
        isValidHouse(request.resource.data.day3) &&
        isValidHouse(request.resource.data.day4) &&
        isValidHouse(request.resource.data.day5) &&
        isValidHouse(request.resource.data.day6) &&
        isValidHouse(request.resource.data.day7) &&
        isValidHouse(request.resource.data.day8) &&
        isValidHouse(request.resource.data.day9);
    }
    
    // Deny access to all other paths
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Helper function to validate allowed house patterns (C-279 through C-294)
    function isValidHouse(val) {
      return val == null || (
        val is string && 
        val.matches('^C-2(79|8[0-9]|9[0-4])$')
      );
    }
  }
}
```

3. Click **Publish**.

---

## 🐙 Step 3: Deploying to GitHub Pages

Because this application uses standard static HTML/CSS and ES modules with relative paths, deploying to GitHub Pages takes less than two minutes.

### 1. Initialize Git & Push to GitHub
Open your terminal in the project directory (`C:\Users\vishv\Desktop\Navratri 2026`):

```bash
# 1. Initialize git repository
git init

# 2. Add all project files
git add .

# 3. Commit files
git commit -m "Initial release of Navratri 2026 Aarti Schedule"

# 4. Create main branch
git branch -M main

# 5. Link to your remote GitHub repository
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/navratri-2026.git

# 6. Push code
git push -u origin main
```

*(Alternatively, you can create a repository on github.com and upload the files directly using GitHub's web interface).*

### 2. Enable GitHub Pages
1. On GitHub, navigate to your repository.
2. Click **Settings** (tab at top).
3. In the left navigation menu, click **Pages**.
4. Under **Build and deployment** > **Branch**:
   - Select **Branch**: `main`
   - Select **Folder**: `/ (root)`
5. Click **Save**.
6. Wait 30–60 seconds. Refresh the page to see your live deployment URL:
   ```text
   https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPO_NAME>/
   ```

---

## ⚙️ Step 4: Customization Guide

### 1. Updating WhatsApp Contact Numbers (`data.js`)
In `data.js`, the `HOUSE_CONTACTS` dictionary maps each house to their WhatsApp number in international format **without** `+` or spaces:

```javascript
export const HOUSE_CONTACTS = {
  "C-279": "919825012345",
  "C-280": "919898023456",
  "C-281": "919426034567",
  // ... continue for C-282 through C-294
  "C-294": "919879098765"
};
```

> [!TIP]
> **Quick Contact List Preparation Workflow**:
> Collect member phone numbers in a simple spreadsheet or text note with format:
> ```text
> C-279 : 9825012345
> C-280 : 9898023456
> ```
> Prefix `91` (India's country code) before each 10-digit number and paste them between quotes in `data.js`.

### 2. Customizing Logo & Banner (`assets/logo.png`)
- The project includes a circular gold emblem in `assets/logo.png`.
- You can replace `assets/logo.png` with your society's custom banner, Maa Durga photo, or Garbi Mandal emblem at any time.
- **Recommended dimensions**: 256×256 or 512×512 square PNG with transparent background.
- If the file is missing or removed, the app automatically switches to an inline SVG Diya emblem without breaking layout.

### 3. Changing the Committee PIN
The default Committee PIN is **`2026`**.

To change the PIN:
1. Open your browser developer console (`F12` > Console) on any page.
2. Run this snippet with your desired PIN (e.g. `"5432"`):
   ```javascript
   async function hash(pin) {
     const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin));
     return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
   }
   hash("5432").then(console.log);
   ```
3. Copy the 64-character hash output.
4. In `firebase-config.js`, update `pinHash`:
   ```javascript
   export const COMMITTEE_CONFIG = {
     requirePinForEdits: true,
     pinHash: "PASTE_YOUR_NEW_HASH_HERE",
     sessionKey: "ghanshyamnagar_navratri_committee_unlocked"
   };
   ```

> [!IMPORTANT]
> **Client-Side PIN Security Notice**:  
> A client-side PIN check is an accidental-edit deterrent designed to prevent everyday viewers or children from tapping buttons unintentionally. Anyone inspecting client-side code in browser dev tools could bypass a JavaScript prompt. True data integrity is enforced by the **Firestore Security Rules** in Step 2.

---

## 🔒 Step 5: Privacy Considerations (Phone Numbers)

When hosting code on GitHub:
1. **Public Repository Notice**: If your GitHub repository is **Public**, anyone in the world can view `data.js` and see member phone numbers.
2. **Recommended Solutions**:
   - **Option A (Recommended)**: Keep the repository **Private**. Note that free GitHub accounts may require GitHub Pro for Pages on private repos.
   - **Option B (Safe Consent)**: Include numbers only for committee representatives or members who have explicitly consented to community publication.
   - **Option C (Manual Number Selection)**: Leave `data.js` numbers as placeholders (`91XXXXXXXXXX`). When clicking "WhatsApp Reminder", the app opens WhatsApp with the message fully prefilled, allowing the sender to select the recipient directly from their personal WhatsApp contact list!

---

## 🔧 Troubleshooting Tips

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Blank white page on GitHub Pages** | Absolute paths used instead of relative paths | Ensure all asset and module links in `index.html` use relative paths (`style.css`, `script.js`, `assets/logo.png`). |
| **"Failed to load module script" (CORS / MIME error)** | Running `index.html` directly via `file:///` in some strict browsers | ES modules require an HTTP/HTTPS server. Push to GitHub Pages or run locally using VS Code Live Server or `npx serve`. |
| **Live badge shows "Demo Mode"** | `firebase-config.js` still has placeholder keys | Open `firebase-config.js` and paste your actual Firebase Project config from the Firebase Console. |
| **"Missing or insufficient permissions" error in console** | Firestore Security Rules not published or incorrect | Open Firebase Console > Firestore Database > Rules, paste the exact rules from Step 2, and click **Publish**. |
| **Gujarati text appears as boxes or squares** | System missing Gujarati font or Google Fonts blocked | The app imports Google's `Noto Sans Gujarati` font with fallbacks to system fonts (`Shruti`, `Nirmala UI`). Ensure an active internet connection on initial load. |
| **WhatsApp link does not open** | Pop-up blocker active in browser | Allow pop-ups for your site in browser settings. The user can also use the "Copy Message" button in the modal. |

---

## 🪔 Aarti Schedule Summary (આસો સુદ એકમ થી નોમ)

| ક્રમ | તારીખ (Date) | વાર (Day) | નોરતાં (Norata) | માતાજીનું સ્વરૂપ (Goddess) | સમય (Aarti Time) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 11 Oct 2026 | Sunday (રવિવાર) | પહેલું નોરતું | મા શૈલપુત્રી (Maa Shailputri) | 8:00 PM onwards |
| 2 | 12 Oct 2026 | Monday (સોમવાર) | બીજું નોરતું | મા બ્રહ્મચારિણી (Maa Brahmacharini) | 8:00 PM onwards |
| 3 | 13 Oct 2026 | Tuesday (મંગળવાર) | ત્રીજું નોરતું | મા ચંદ્રઘંટા (Maa Chandraghanta) | 8:00 PM onwards |
| 4 | 14 Oct 2026 | Wednesday (બુધવાર) | ચોથું નોરતું | મા કુષ્માંડા (Maa Kushmanda) | 8:00 PM onwards |
| 5 | 15 Oct 2026 | Thursday (ગુરુવાર) | પાંચમું નોરતું | મા સ્કંદમાતા (Maa Skandamata) | 8:00 PM onwards |
| 6 | 16 Oct 2026 | Friday (શુક્રવાર) | છઠ્ઠું નોરતું | મા કાત્યાયની (Maa Katyayani) | 8:00 PM onwards |
| 7 | 17 Oct 2026 | Saturday (શનિવાર) | સાતમું નોરતું | મા કાલરાત્રિ (Maa Kalaratri) | 8:00 PM onwards |
| 8 | 18 Oct 2026 | Sunday (રવિવાર) | આઠમું નોરતું (દુર્ગાષ્ટમી) | મા મહાગૌરી (Maa Mahagauri) | 8:00 PM onwards |
| 9 | 19 Oct 2026 | Monday (સોમવાર) | નવમું નોરતું (મહાનવમી) | મા સિદ્ધિદાત્રી (Maa Siddhidatri) | 8:00 PM onwards |

---

**જય માતાજી! ઘનશ્યામનગર ટેનામેન્ટ નવરાત્રી સમિતિ - ૨૦૨૬**
