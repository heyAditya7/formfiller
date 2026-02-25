import type { Language } from "../context/LanguageContext";
import { translationMap } from "./translationMap";

export interface FieldTranslation {
  meaning: string;
  writeGuide: string;
  example: string;
}

export interface FormField {
  id: string;
  label: string;
  placeholder: string;
  meaning: string;
  writeGuide: string;
  example: string;
  /** Hindi, Tamil, Telugu (and optional Odia) for Info panel */
  translations?: {
    hi?: FieldTranslation;
    ta?: FieldTranslation;
    te?: FieldTranslation;
    or?: FieldTranslation;
  };
  validation?: (value: string) => string | null;
  type?: string;
  mandatory: boolean;
}

/** Get meaning, writeGuide, example for current language (centralized translations + per-field fallback) */
export function getFieldInfoForLanguage(
  field: FormField,
  lang: Language | string
): { meaning: string; writeGuide: string; example: string } {
  const key: Language | null =
    lang === "hi" || lang === "ta" || lang === "te" || lang === "or" || lang === "en"
      ? (lang as Language)
      : null;

  // 1) Central translation map (covers multi-language help content)
  if (key) {
    const fromMap = translationMap[field.id]?.[key];
    if (fromMap) {
      return {
        meaning: fromMap.meaning,
        writeGuide: fromMap.writeGuide,
        example: fromMap.example,
      };
    }
  }

  // 2) Per-field embedded translations
  const t = key && field.translations ? field.translations[key] : null;

  // 3) Fallback to English base text
  return {
    meaning: t?.meaning ?? field.meaning,
    writeGuide: t?.writeGuide ?? field.writeGuide,
    example: t?.example ?? field.example,
  };
}

// This simulates data from MongoDB backend
// In production, this would be fetched via API
export const mockFormFields: FormField[] = [
  {
    id: "fullName",
    label: "Full Name",
    placeholder: "Enter your complete name",
    meaning: "Your legal name as it appears on official documents like Aadhaar, PAN card, or passport",
    writeGuide: "Write your first name, middle name (if any), and last name exactly as shown in your ID",
    example: "Rahul Kumar Singh",
    translations: {
      hi: { meaning: "आधिकारिक दस्तावेज़ों (आधार, पैन, पासपोर्ट) में दिखने वाला आपका कानूनी नाम", writeGuide: "पहला नाम, मध्य नाम (यदि कोई), अंतिम नाम - आईडी जैसा ही लिखें", example: "राहुल कुमार सिंह" },
      ta: { meaning: "அதிகாரப்பூர்வ ஆவணங்களில் (ஆதார், பான், பாஸ்போர்ட்) தோன்றும் உங்கள் சட்டப் பெயர்", writeGuide: "முதல் பெயர், இடைப் பெயர் (ஏதேனும் இருந்தால்), கடைசி பெயர் - ஐடியில் உள்ளதைப் போல எழுதுங்கள்", example: "ராகுல் குமார் சிங்" },
      te: { meaning: "అధికారిక డాక్యుమెంట్లలో (ఆధార్, పాన్, పాస్పోర్ట్) కనిపించే మీ చట్టపరమైన పేరు", writeGuide: "మొదటి పేరు, మధ్య పేరు (ఉంటే), చివరి పేరు - IDలో ఉన్నట్లే రాయండి", example: "రాహుల్ కుమార్ సింగ్" },
    },
    mandatory: true,
    validation: (value) => {
      if (value.length < 3) return "Name must be at least 3 characters";
      if (!/^[a-zA-Z\s]+$/.test(value)) return "Name should only contain letters";
      return null;
    },
  },
  {
    id: "dateOfBirth",
    label: "Date of Birth",
    placeholder: "DD/MM/YYYY",
    type: "date",
    meaning: "The date you were born as mentioned in your birth certificate or Aadhaar card",
    writeGuide: "Enter in Day/Month/Year format. Double-check the year!",
    example: "15/08/1990",
    translations: {
      hi: { meaning: "जन्म प्रमाण पत्र या आधार में दर्ज जन्म की तारीख", writeGuide: "दिन/महीना/साल में डालें। साल ज़रूर जांचें!", example: "15/08/1990" },
      ta: { meaning: "பிறந்த சான்றிதழ் அல்லது ஆதாரில் உள்ள பிறந்த தேதி", writeGuide: "நாள்/மாதம்/ஆண்டு வடிவத்தில் உள்ளிடவும். ஆண்டை சரிபார்க்கவும்!", example: "15/08/1990" },
      te: { meaning: "పుట్టిన సర్టిఫికేట్ లేదా ఆధార్‌లో ఉన్న పుట్టిన తేదీ", writeGuide: "రోజు/నెల/సంవత్సరం ఫార్మాట్‌లో నమోదు చేయండి. సంవత్సరాన్ని తనిఖీ చేయండి!", example: "15/08/1990" },
    },
    mandatory: true,
    validation: (value) => {
      if (!value) return "Date of birth is required";
      const date = new Date(value);
      const now = new Date();
      if (date > now) return "Date cannot be in the future";
      const age = now.getFullYear() - date.getFullYear();
      if (age > 120) return "Please enter a valid date";
      return null;
    },
  },
  {
    id: "email",
    label: "Email Address",
    placeholder: "your.email@example.com",
    type: "email",
    meaning: "Your electronic mail address for official communication and updates",
    writeGuide: "Make sure it's an active email you check regularly. Include @ and domain name",
    example: "rahul.kumar@gmail.com",
    mandatory: true,
    validation: (value) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Please enter a valid email address";
      }
      return null;
    },
  },
  {
    id: "phoneNumber",
    label: "Mobile Number",
    placeholder: "10-digit mobile number",
    type: "tel",
    meaning: "Your active mobile number, preferably linked to your Aadhaar",
    writeGuide: "Enter 10 digits without spaces or dashes. This number will receive OTP for verification",
    example: "9876543210",
    mandatory: true,
    validation: (value) => {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length !== 10) return "Mobile number must be exactly 10 digits";
      if (!/^[6-9]/.test(cleaned)) return "Mobile number should start with 6, 7, 8, or 9";
      return null;
    },
  },
  {
    id: "aadhaar",
    label: "Aadhaar Number",
    placeholder: "XXXX XXXX XXXX",
    meaning: "Your 12-digit unique identification number issued by UIDAI",
    writeGuide: "Enter all 12 digits carefully. You can add spaces after every 4 digits for clarity",
    example: "1234 5678 9012",
    mandatory: true,
    validation: (value) => {
      const cleaned = value.replace(/\s/g, "");
      if (cleaned.length !== 12) return "Aadhaar must be exactly 12 digits";
      if (!/^\d+$/.test(cleaned)) return "Aadhaar should only contain numbers";
      return null;
    },
  },
  {
    id: "address",
    label: "Residential Address",
    placeholder: "House number, street, locality",
    meaning: "Your current complete residential address where you live",
    writeGuide: "Include house/flat number, building name, street, and locality",
    example: "Flat 401, Sunshine Apartments, MG Road, Sector 12",
    mandatory: true,
  },
  {
    id: "city",
    label: "City",
    placeholder: "Enter your city",
    meaning: "The city or town where you currently reside",
    writeGuide: "Write the complete official name of your city",
    example: "Bhubaneswar",
    mandatory: true,
  },
  {
    id: "state",
    label: "State",
    placeholder: "Select your state",
    meaning: "Your state or union territory in India",
    writeGuide: "Choose from the list or write the full state name",
    example: "Odisha",
    mandatory: true,
  },
  {
    id: "pincode",
    label: "PIN Code",
    placeholder: "6-digit PIN code",
    meaning: "The Postal Index Number of your area for mail delivery",
    writeGuide: "Enter the exact 6-digit PIN code of your locality",
    example: "751024",
    mandatory: true,
    validation: (value) => {
      if (!/^\d{6}$/.test(value)) return "PIN code must be exactly 6 digits";
      return null;
    },
  },
  {
    id: "fatherName",
    label: "Father's Name",
    placeholder: "Enter father's name",
    meaning: "Your father's complete name as per official records",
    writeGuide: "Write exactly as it appears in official documents",
    example: "Raj Kumar Singh",
    mandatory: false,
  },
  {
    id: "motherName",
    label: "Mother's Name",
    placeholder: "Enter mother's name",
    meaning: "Your mother's complete name as per official records",
    writeGuide: "Write exactly as it appears in official documents",
    example: "Sunita Singh",
    mandatory: false,
  },
  {
    id: "occupation",
    label: "Occupation",
    placeholder: "Enter your occupation",
    meaning: "Your current job or profession",
    writeGuide: "Mention your current profession or student status",
    example: "Software Engineer / Student / Business",
    mandatory: false,
  },
  { id: "gender", label: "Gender", placeholder: "Select gender", meaning: "Your gender as per official records", writeGuide: "Select Male, Female, or Other", example: "Male", mandatory: false },
  { id: "maritalStatus", label: "Marital Status", placeholder: "Single / Married / Other", meaning: "Your current marital status", writeGuide: "Select as per records", example: "Single", mandatory: false },
  { id: "nationality", label: "Nationality", placeholder: "e.g. Indian", meaning: "Your nationality", writeGuide: "Usually Indian for Indian forms", example: "Indian", mandatory: false },
  { id: "pan", label: "PAN Number", placeholder: "XXXXX1234X", meaning: "Permanent Account Number (Income Tax)", writeGuide: "10-character PAN from card", example: "ABCDE1234F", mandatory: false },
  { id: "bloodGroup", label: "Blood Group", placeholder: "e.g. O+", meaning: "Your blood group", writeGuide: "A+, B+, O+, AB+, etc.", example: "O+", mandatory: false },
  { id: "religion", label: "Religion", placeholder: "Optional", meaning: "Your religion if required", writeGuide: "As per official records", example: "Hindu", mandatory: false },
  { id: "category", label: "Category", placeholder: "General / OBC / SC / ST", meaning: "Category if applicable", writeGuide: "As per certificate", example: "General", mandatory: false },
  { id: "qualification", label: "Educational Qualification", placeholder: "e.g. B.Tech, Class 12", meaning: "Highest qualification", writeGuide: "Degree or class completed", example: "B.Tech", mandatory: false },
  { id: "annualIncome", label: "Annual Income", placeholder: "In INR", meaning: "Yearly income if asked", writeGuide: "Approximate in rupees", example: "500000", mandatory: false },
  { id: "bankName", label: "Bank Name", placeholder: "Name of bank", meaning: "Bank where you have an account", writeGuide: "Full bank name", example: "State Bank of India", mandatory: false },
  { id: "accountNumber", label: "Bank Account Number", placeholder: "Account number", meaning: "Your bank account number", writeGuide: "As per passbook", example: "1234567890", mandatory: false },
  { id: "ifscCode", label: "IFSC Code", placeholder: "e.g. SBIN0001234", meaning: "Indian Financial System Code", writeGuide: "11-character IFSC of branch", example: "SBIN0001234", mandatory: false },
  { id: "passportNo", label: "Passport Number", placeholder: "If applicable", meaning: "Passport number", writeGuide: "As on passport", example: "A1234567", mandatory: false },
  { id: "drivingLicenseNo", label: "Driving License Number", placeholder: "DL number", meaning: "Driving license if applicable", writeGuide: "As on license", example: "OD02-2020-1234567", mandatory: false },
  { id: "voterId", label: "Voter ID (EPIC)", placeholder: "Optional", meaning: "Voter ID number", writeGuide: "As on card", example: "ABC1234567", mandatory: false },
  { id: "rationCardNo", label: "Ration Card Number", placeholder: "If applicable", meaning: "Ration card number", writeGuide: "As on card", example: "123456789012", mandatory: false },
  { id: "landline", label: "Landline Number", placeholder: "With STD code", meaning: "Landline if any", writeGuide: "e.g. 0674-1234567", example: "0674-1234567", mandatory: false },
  { id: "alternatePhone", label: "Alternate Mobile", placeholder: "10-digit", meaning: "Secondary mobile number", writeGuide: "Optional second number", example: "9876543210", mandatory: false },
  { id: "alternateEmail", label: "Alternate Email", placeholder: "Optional", meaning: "Secondary email", writeGuide: "If you have another email", example: "backup@example.com", mandatory: false },
  { id: "district", label: "District", placeholder: "Your district", meaning: "District of residence", writeGuide: "Full district name", example: "Khordha", mandatory: false },
  { id: "tehsil", label: "Tehsil / Taluk", placeholder: "If applicable", meaning: "Tehsil or taluk", writeGuide: "Administrative division", example: "Bhubaneswar", mandatory: false },
  { id: "village", label: "Village / Locality", placeholder: "Village or locality name", meaning: "Village or locality", writeGuide: "As per address", example: "Sector 12", mandatory: false },
  { id: "postOffice", label: "Post Office", placeholder: "Nearest post office", meaning: "Nearest post office name", writeGuide: "With PIN", example: "Bhubaneswar GPO", mandatory: false },
  { id: "nomineeName", label: "Nominee Name", placeholder: "If applicable", meaning: "Nominee for schemes", writeGuide: "Full name of nominee", example: "Priya Singh", mandatory: false },
  { id: "nomineeRelation", label: "Nominee Relation", placeholder: "e.g. Spouse, Son", meaning: "Relation with nominee", writeGuide: "Relationship", example: "Spouse", mandatory: false },
  { id: "emergencyContact", label: "Emergency Contact", placeholder: "Name and number", meaning: "Person to contact in emergency", writeGuide: "Name and 10-digit number", example: "Raj 9876543210", mandatory: false },
  { id: "signatureDate", label: "Date of Signature", placeholder: "DD/MM/YYYY", meaning: "Date of signing form", writeGuide: "Today's date usually", example: "16/02/2025", type: "date", mandatory: false },
  { id: "place", label: "Place", placeholder: "City/Town name", meaning: "Place where form is filled", writeGuide: "City or town", example: "Bhubaneswar", mandatory: false },
  { id: "declaration", label: "Declaration", placeholder: "I hereby declare...", meaning: "Declaration if required", writeGuide: "Standard declaration text", example: "I hereby declare that the above details are correct.", mandatory: false },
];

/** Canonical deduplicated export — always unique by field.id */
export const formFields: FormField[] = mockFormFields.filter(
  (field, index, self) => index === self.findIndex((f) => f.id === field.id)
);
