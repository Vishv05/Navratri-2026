/**
 * Firebase & Committee Configuration
 * Society: Ghanshyamnagar Tenament, Ghodasar - 380050
 *
 * Configured automatically for project: ghanshyamnagar-navratri-2026
 */

export const firebaseConfig = {
  apiKey: "AIzaSyCsN9LOg8tIoWdUdgt9s5LdDWNcjes5lPE",
  authDomain: "ghanshyamnagar-navratri-2026.firebaseapp.com",
  projectId: "ghanshyamnagar-navratri-2026",
  storageBucket: "ghanshyamnagar-navratri-2026.firebasestorage.app",
  messagingSenderId: "919830833884",
  appId: "1:919830833884:web:12ffbd89323195574ae219"
};

/**
 * Firestore Database Settings
 */
export const FIRESTORE_SETTINGS = {
  collectionName: "navratri2026",
  documentId: "assignments"
};

/**
 * Committee Edit-Protection Settings
 *
 * To prevent accidental clicks or edits by general viewers, a Committee PIN
 * can be required to select, change, or reset assignments.
 *
 * Default PIN: "2026"
 * Stored as SHA-256 hash below:
 * Hash of "2026": 158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab
 */
export const COMMITTEE_CONFIG = {
  // Set to false: Anyone visiting the page can select freely with zero PIN prompts
  requirePinForEdits: false,

  // SHA-256 hash of "2026"
  pinHash: "158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab",

  // Session storage key for committee unlock status
  sessionKey: "ghanshyamnagar_navratri_committee_unlocked"
};
