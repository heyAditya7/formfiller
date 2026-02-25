/**
 * OCR / Text extraction and key-value mapping for 50+ form fields
 * Supports PDF (pdf-parse) and images (tesseract.js)
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
let pdfParse;
try {
  pdfParse = require("pdf-parse");
} catch (_) {
  pdfParse = null;
}

// Known field IDs and their label patterns (English + common variants) for mapping
// De-duped: removed repeated gender/maritalStatus/nationality entries
const FIELD_PATTERNS = [
  { id: "fullName", patterns: [/full\s*name/i, /name\s*of\s*applicant/i, /applicant.*name/i, /पूरा\s*नाम/i, /முழு\s*பெயர்/i, /పూర్తి\s*పేరు/i] },
  { id: "dateOfBirth", patterns: [/date\s*of\s*birth/i, /d\.o\.b/i, /\bdob\b/i, /जन्म\s*तिथि/i, /பிறந்த\s*தேதி/i, /పుట్టిన\s*తేదీ/i, /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/] },
  { id: "email", patterns: [/email/i, /e-?mail/i, /ईमेल/i, /மின்னஞ்சல்/i, /ఇమెయిల్/i, /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/] },
  { id: "phoneNumber", patterns: [/mobile/i, /phone/i, /contact\s*no/i, /मोबाइल/i, /மொபைல்/i, /మొబైల్/i, /\b[6-9]\d{9}\b/] },
  { id: "aadhaar", patterns: [/aadhaar|aadhar|uid/i, /आधार/i, /ஆதார்/i, /ఆధార్/i, /\b\d{4}\s*\d{4}\s*\d{4}\b/] },
  { id: "address", patterns: [/address/i, /residential/i, /पता/i, /முகவரி/i, /చిరునామా/i] },
  { id: "city", patterns: [/city/i, /town/i, /शहर/i, /நகரம்/i, /నగరం/i] },
  { id: "state", patterns: [/\bstate\b/i, /राज्य/i, /மாநிலம்/i, /రాష్ట్రం/i] },
  { id: "pincode", patterns: [/pincode|pin\s*code|postal/i, /पिन/i, /பின்/i, /పిన్/i, /\b\d{6}\b/] },
  { id: "fatherName", patterns: [/father/i, /पिता/i, /தந்தை/i, /తండ్రి/i] },
  { id: "motherName", patterns: [/mother/i, /माता/i, /தாய்/i, /తల్లి/i] },
  { id: "occupation", patterns: [/occupation/i, /profession/i, /पेशा/i, /தொழில்/i, /వృత్తి/i] },
  { id: "gender", patterns: [/\bgender\b/i, /\bsex\b/i, /लिंग/i, /பாலினம்/i] },
  { id: "maritalStatus", patterns: [/marital/i, /marriage/i, /वैवाहिक/i] },
  { id: "nationality", patterns: [/nationality/i, /राष्ट्रीयता/i] },
  { id: "bloodGroup", patterns: [/blood\s*group/i] },
  { id: "qualification", patterns: [/qualification|education/i] },
  { id: "bankName", patterns: [/bank\s*name/i] },
  { id: "accountNumber", patterns: [/account\s*no|ac\s*no/i] },
  { id: "ifscCode", patterns: [/ifsc/i] },
  { id: "passportNo", patterns: [/passport/i] },
  { id: "drivingLicenseNo", patterns: [/driving\s*license|dl\s*no/i] },
  { id: "district", patterns: [/district/i] },
  { id: "village", patterns: [/village|locality/i] },
  { id: "place", patterns: [/\bplace\b/i] },
  { id: "pan", patterns: [/pan\s*no|permanent\s*account/i, /\b[A-Z]{5}\d{4}[A-Z]\b/] },
];

/**
 * Extract text from a PDF buffer
 */
export async function extractTextFromPDF(buffer) {
  if (!pdfParse) {
    console.warn("[OCR] pdf-parse not installed.");
    return "";
  }
  try {
    const data = await pdfParse(buffer);
    return (data && data.text) ? data.text : "";
  } catch (err) {
    console.error("[OCR] PDF parse error:", err.message);
    return "";
  }
}

/**
 * Extract text from image buffer using Tesseract (if available)
 */
let Tesseract = null;
try {
  const tesseract = await import("tesseract.js");
  Tesseract = tesseract.default;
} catch (_) {
  console.warn("[OCR] tesseract.js not installed; image OCR disabled.");
}

export async function extractTextFromImage(buffer, mimeType) {
  if (!Tesseract) return "";
  try {
    const { data } = await Tesseract.recognize(Buffer.from(buffer), "eng", {
      logger: () => { },
    });
    return data?.text || "";
  } catch (err) {
    console.error("[OCR] Image OCR error:", err.message);
    return "";
  }
}

/**
 * Extract text from file based on mime type
 */
export async function extractTextFromFile(buffer, mimeType, originalName = "") {
  const isPDF = mimeType === "application/pdf" || /\.pdf$/i.test(originalName);
  const isImage = /^image\//.test(mimeType) || /\.(jpg|jpeg|png|gif|bmp|tiff?)$/i.test(originalName);

  if (isPDF) return extractTextFromPDF(buffer);
  if (isImage) return extractTextFromImage(buffer, mimeType);
  return "";
}

// Normalize: strip spaces, punctuation, lowercase — for tolerant matching
function normalize(str) {
  return str.toLowerCase().replace(/[\s\-_.,;:()\[\]\/\\]+/g, "");
}

/**
 * 3-tier label → field ID mapping:
 *   Tier 1: Regex patterns (existing, case-insensitive)
 *   Tier 2: Normalized keyword includes (ignores spaces/punctuation)
 *   Tier 3: Loose single-keyword fallback
 */
function mapLabelToFieldId(label) {
  const lower = label.toLowerCase().trim();
  const norm = normalize(label);

  // Tier 1: regex patterns
  for (const { id, patterns } of FIELD_PATTERNS) {
    if (patterns.some((p) => {
      if (typeof p === "string") return lower.includes(p.toLowerCase());
      return p.test(label) || p.test(lower);
    })) return id;
  }

  // Tier 2: normalized keyword includes
  const KEYWORD_MAP = [
    { id: "fullName", keys: ["fullname", "nameofapplicant", "applicantname", "fullnameofapplicant", "nameofcandidate"] },
    { id: "dateOfBirth", keys: ["dateofbirth", "dob", "birthdate", "bornon", "datebirth", "dateofbirthdd"] },
    { id: "email", keys: ["email", "emailid", "emailaddress", "mail"] },
    { id: "phoneNumber", keys: ["mobile", "phone", "mobileno", "phoneno", "contactno", "cellno", "cell", "contactnumber"] },
    { id: "aadhaar", keys: ["aadhaar", "aadhar", "uidno", "uidainumber", "adhaar"] },
    { id: "address", keys: ["address", "residentialaddress", "permanentaddress", "presentaddress", "houseaddress"] },
    { id: "city", keys: ["city", "town", "citytown", "cityname"] },
    { id: "state", keys: ["state", "statename", "stateofresidence"] },
    { id: "pincode", keys: ["pincode", "pinno", "postalcode", "zip", "zipcode"] },
    { id: "fatherName", keys: ["fathername", "fathersname", "fatherof", "nameoffather"] },
    { id: "motherName", keys: ["mothername", "mothersname", "nameofmother"] },
    { id: "occupation", keys: ["occupation", "profession", "jobtitle", "designation", "work"] },
    { id: "gender", keys: ["gender", "sex"] },
    { id: "maritalStatus", keys: ["maritalstatus", "marital", "marriagestatus"] },
    { id: "nationality", keys: ["nationality", "citizen", "citizenship"] },
    { id: "bloodGroup", keys: ["bloodgroup", "bloodtype", "bg"] },
    { id: "qualification", keys: ["qualification", "education", "educationalqualification", "highestqualification"] },
    { id: "bankName", keys: ["bankname", "bank", "bankofaccount", "nameofbank"] },
    { id: "accountNumber", keys: ["accountno", "accountnumber", "acno", "acnumber", "bankaccountno"] },
    { id: "ifscCode", keys: ["ifsc", "ifsccode"] },
    { id: "passportNo", keys: ["passport", "passportno", "passportnumber"] },
    { id: "drivingLicenseNo", keys: ["drivinglicense", "dlno", "drivinglicenceno", "driverlicense"] },
    { id: "district", keys: ["district", "districtname"] },
    { id: "village", keys: ["village", "locality", "villagename"] },
    { id: "place", keys: ["place", "placeofsigning"] },
    { id: "pan", keys: ["pan", "panno", "pannumber", "permanentaccount"] },
    { id: "voterId", keys: ["voterid", "epic", "epicno", "votercard"] },
    { id: "religion", keys: ["religion"] },
    { id: "category", keys: ["category", "caste", "castecategory"] },
    { id: "annualIncome", keys: ["annualincome", "income", "yearlyincome"] },
    { id: "tehsil", keys: ["tehsil", "taluk", "mandal"] },
    { id: "nomineeName", keys: ["nominee", "nomineename"] },
    { id: "nomineeRelation", keys: ["nomineerelation", "relationwithnominee"] },
  ];

  for (const { id, keys } of KEYWORD_MAP) {
    if (keys.some((k) => norm.includes(k))) return id;
  }

  // Tier 3: loose single keyword fallback
  const LOOSE = [
    { id: "fullName", kw: "name" },
    { id: "dateOfBirth", kw: "birth" },
    { id: "dateOfBirth", kw: "born" },
    { id: "email", kw: "email" },
    { id: "phoneNumber", kw: "phone" },
    { id: "phoneNumber", kw: "mobile" },
    { id: "aadhaar", kw: "aadh" },
    { id: "address", kw: "address" },
    { id: "fatherName", kw: "father" },
    { id: "motherName", kw: "mother" },
    { id: "pan", kw: "pan" },
    { id: "pincode", kw: "pin" },
  ];
  for (const { id, kw } of LOOSE) {
    if (norm.includes(kw)) return id;
  }

  return null;
}

/**
 * Multi-pass extraction:
 *   Pass 1 — structured "Label: Value" lines
 *   Pass 2 — entity regex (email, phone, aadhaar, PAN, pincode, date)
 *   Pass 3 — context next-line (standalone label followed by value line)
 *   Pass 4 — priority name fallback (inline, proper-case, loose)
 *   Pass 5 — final DOB fallback
 */
export function extractKeyValuePairs(rawText) {
  console.log("[OCR] Raw text length:", rawText.length);
  console.log("[OCR] Preview (first 600 chars):", rawText.substring(0, 600));

  const answers = {};
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // --- PASS 1: "Label: Value", "Label - Value", "Label = Value" ---
  for (const line of lines) {
    const match = line.match(/^([^:\-=]{1,60})[\:\-=]\s*(.{1,300})$/);
    if (match) {
      const label = match[1].trim();
      const value = match[2].trim();
      if (label.length > 0 && value.length > 0) {
        const fieldId = mapLabelToFieldId(label);
        if (fieldId && !answers[fieldId]) {
          answers[fieldId] = value;
          console.log(`[OCR] P1 "${label}" → ${fieldId}: "${value}"`);
        }
      }
    }
  }

  // --- PASS 2: Entity regex extraction ---
  if (!answers.email) {
    const m = rawText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    if (m) { answers.email = m[0]; console.log("[OCR] P2 email:", m[0]); }
  }
  if (!answers.phoneNumber) {
    const m = rawText.match(/\b([6-9]\d{9})\b/);
    if (m) { answers.phoneNumber = m[1]; console.log("[OCR] P2 phone:", m[1]); }
  }
  if (!answers.aadhaar) {
    const m = rawText.match(/\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4})\b/);
    if (m) { answers.aadhaar = m[1].replace(/[\s\-]/g, " ").trim(); console.log("[OCR] P2 aadhaar:", answers.aadhaar); }
  }
  if (!answers.pan) {
    const m = rawText.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
    if (m) { answers.pan = m[1]; console.log("[OCR] P2 PAN:", m[1]); }
  }
  if (!answers.pincode) {
    const m = rawText.match(/\b(\d{6})\b/);
    if (m) { answers.pincode = m[1]; console.log("[OCR] P2 pincode:", m[1]); }
  }
  if (!answers.dateOfBirth) {
    const m = rawText.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/);
    if (m) { answers.dateOfBirth = m[1]; console.log("[OCR] P2 DOB:", m[1]); }
  }

  // --- PASS 3: Context next-line scan (standalone label then value on next line) ---
  for (let i = 0; i < lines.length - 1; i++) {
    const labelLine = lines[i];
    const valueLine = lines[i + 1];
    if (/^[A-Za-z\s\/\.\(\)]{3,40}$/.test(labelLine) && valueLine.length < 200) {
      const fieldId = mapLabelToFieldId(labelLine);
      if (fieldId && !answers[fieldId]) {
        answers[fieldId] = valueLine;
        console.log(`[OCR] P3 next-line "${labelLine}" → ${fieldId}: "${valueLine}"`);
      }
    }
  }

  // --- PASS 4: Priority name fallback ---
  if (!answers.fullName) {
    // 4a: "name: Xyz" anywhere in raw text
    const m = rawText.match(/\bname\s*[:\-]\s*([A-Za-z][A-Za-z\s]{2,48})/i);
    if (m) { answers.fullName = m[1].trim(); console.log("[OCR] P4a inline name:", answers.fullName); }
  }
  if (!answers.fullName) {
    // 4b: First line that is 2+ proper-case words
    for (const line of lines) {
      if (/^[A-Z][a-zA-Z]+(\s+[A-Z][a-zA-Z]+){1,4}$/.test(line.trim())) {
        answers.fullName = line.trim();
        console.log("[OCR] P4b proper-case name:", answers.fullName);
        break;
      }
    }
  }
  if (!answers.fullName) {
    // 4c: First letters-only line >= 2 words
    for (const line of lines) {
      const t = line.trim();
      if (/^[A-Za-z\s]{3,50}$/.test(t) && t.split(" ").length >= 2) {
        answers.fullName = t;
        console.log("[OCR] P4c loose name:", answers.fullName);
        break;
      }
    }
  }

  // --- PASS 5: Final DOB fallback ---
  if (!answers.dateOfBirth) {
    const m = rawText.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
    if (m) { answers.dateOfBirth = m[1]; console.log("[OCR] P5 fallback DOB:", m[1]); }
  }

  console.log("[OCR] Final answers:", JSON.stringify(answers));
  return answers;
}

export const KNOWN_FIELD_IDS = [...new Set(FIELD_PATTERNS.map((f) => f.id))];
