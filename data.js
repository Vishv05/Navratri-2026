/**
 * Navratri 2026 - Schedule & Society Configuration Data
 * Society: Ghanshyamnagar Tenament, Ghodasar - 380050
 *
 * This file contains the 9-day Aarti schedule, list of member houses (C-279 to C-294),
 * contact WhatsApp numbers, daily Navratri quotes, and message templates.
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
 * Format: International phone number digits only (no '+', no spaces, no dashes).
 * Example for India: "919876543210" (Country code 91 + 10-digit mobile number)
 *
 * ⚠️ Replace the placeholders below with the actual resident WhatsApp numbers.
 */
export const HOUSE_CONTACTS = {
  "C-279": "919723302459",
  "C-280": "919687497024",
  "C-281": "919408145834",
  "C-282": "917990254394","919427958119",
  "C-283": "918128197789","917600082467",
  "C-284": "919924014723","919586971399",
  "C-285": "918905819029","919327060712",
  "C-286": "919974847363",
  "C-287": "919824057465",
  "C-288": "919824656188","919426631668",
  "C-289": "919898944337","919033022061","917567704665",
  "C-290": "919913648520",
  "C-291": "919879038348",
  "C-292": "919512662229",
  "C-293": "917069908394",
  "C-294": "919328235675"
};

/**
 * 9 Days of Navratri 2026 Schedule
 */
export const SCHEDULE = [
  {
    dayNum: 1,
    dateStr: "11 Oct 2026",
    isoDate: "2026-10-11",
    dayName: "Sunday (રવિવાર)",
    dayNameGujarati: "રવિવાર",
    norata: "પહેલું નોરતું",
    goddess: "Maa Shailputri (મા શૈલપુત્રી)",
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
    norata: "બીજું નોરતું",
    goddess: "Maa Brahmacharini (મા બ્રહ્મચારિણી)",
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
    norata: "ત્રીજું નોરતું",
    goddess: "Maa Chandraghanta (મા ચંદ્રઘંટા)",
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
    norata: "ચોથું નોરતું",
    goddess: "Maa Kushmanda (મા કુષ્માંડા)",
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
    norata: "પાંચમું નોરતું",
    goddess: "Maa Skandamata (મા સ્કંદમાતા)",
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
    norata: "છઠ્ઠું નોરતું",
    goddess: "Maa Katyayani (મા કાત્યાયની)",
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
    norata: "સાતમું નોરતું",
    goddess: "Maa Kalaratri (મા કાલરાત્રિ)",
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
    norata: "આઠમું નોરતું (દુર્ગાષ્ટમી)",
    goddess: "Maa Mahagauri (મા મહાગૌરી)",
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
    norata: "નવમું નોરતું (મહાનવમી)",
    goddess: "Maa Siddhidatri (મા સિદ્ધિદાત્રી)",
    quote: {
      gujarati: "સર્વ સિદ્ધિ અને સુખ આપનારી મા સિદ્ધિદાત્રી આપના ઘરમાં અખંડ આનંદ સ્થાપે.",
      english: "May Maa Siddhidatri bestow ultimate wisdom, divine accomplishment, and supreme joy."
    }
  }
];

/**
 * Helper to build the bilingual WhatsApp reminder message
 * @param {number} dayNum 1-9
 * @param {string} houseNo e.g. "C-284"
 * @returns {string} Fully formatted message string
 */
export function buildWhatsAppMessage(dayNum, houseNo) {
  const day = SCHEDULE.find(d => d.dayNum === dayNum);
  if (!day) return "";

  return `🪔 જય માતાજી! / Jai Mataji! 🙏\n\n` +
    `આદરણીય પરિવારજન (મકાન નં. ${houseNo}),\n` +
    `${SOCIETY_INFO.fullTitle} તરફથી નવરાત્રી ૨૦૨૬ ની આપને અને આપના સમગ્ર પરિવારને હાર્દિક શુભકામનાઓ! 🌺\n\n` +
    `આપશ્રીના પરિવારની પાવન સંધ્યા આરતીની વિગત:\n` +
    `✨ નોરતું: ${day.norata} (${day.goddess})\n` +
    `📅 તારીખ: ${day.dateStr} [${day.dayName}]\n` +
    `⏰ સમય: ${SOCIETY_INFO.aartiTimeGujarati} (${SOCIETY_INFO.aartiTime})\n` +
    `📍 સ્થળ: ${SOCIETY_INFO.venueGujarati} (${SOCIETY_INFO.name})\n\n` +
    `🌺 આજના નોરતાનું સુવિચાર:\n` +
    `"${day.quote.gujarati}"\n` +
    `("${day.quote.english}")\n\n` +
    `આપ સર્વે પરિવારજનો સાથે સમયસર આરતીમાં પધારી માતાજીના આશીર્વાદ અને પ્રસાદ ગ્રહણ કરશો એવી નમ્ર વિનંતી છે. 🙏🪔✨\n\n` +
    `— આયોજક: ${SOCIETY_INFO.name} નવરાત્રી સમિતિ\n` +
    `https://ghanshyamnagar.society/navratri2026`;
}
