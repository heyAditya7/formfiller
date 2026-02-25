import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "hi" | "or" | "ta" | "te";

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Navbar
  home: { en: "Home", hi: "होम", or: "ହୋମ", ta: "முகப்பு", te: "హోమ్" },
  startNewForm: { en: "Start New Form", hi: "नया फॉर्म शुरू करें", or: "ନୂଆ ଫର୍ମ ଆରମ୍ଭ କରନ୍ତୁ", ta: "புதிய படிவத்தைத் தொடங்குங்கள்", te: "కొత్త ఫారమ్ ప్రారంభించండి" },
  howItWorks: { en: "How It Works", hi: "यह कैसे काम करता है", or: "ଏହା କିପରି କାମ କରେ", ta: "இது எப்படி வேலை செய்கிறது", te: "ఇది ఎలా పనిచేస్తుంది" },
  help: { en: "Help", hi: "सहायता", or: "ସାହାଯ୍ୟ", ta: "உதவி", te: "సహాయం" },
  
  // Form fields
  fullName: { en: "Full Name", hi: "पूरा नाम", or: "ସମ୍ପୂର୍ଣ୍ଣ ନାମ", ta: "முழு பெயர்", te: "పూర్తి ేరు" },
  dateOfBirth: { en: "Date of Birth", hi: "जन्म तिथि", or: "ଜନ୍ମ ତାରିଖ", ta: "பிறந்த தேதி", te: "పుట్టిన తేదీ" },
  email: { en: "Email Address", hi: "ईमेल पता", or: "ଇମେଲ ଠିକଣା", ta: "மின்னஞ்சல் முகவரி", te: "ఇమెయిల్ చిరునామా" },
  phoneNumber: { en: "Mobile Number", hi: "मोबाइल नंबर", or: "ମୋବାଇଲ ନମ୍ବର", ta: "மொபைல் எண்", te: "మొబైల్ నంబర్" },
  aadhaar: { en: "Aadhaar Number", hi: "आधार नंबर", or: "ଆଧାର ନମ୍ବର", ta: "ஆதார் எண்", te: "ఆధార్ నంబర్" },
  address: { en: "Residential Address", hi: "आवासीय पता", or: "ଆବାସିକ ଠିକଣା", ta: "குடியிருப்பு முகவரி", te: "నివాస చిరునామా" },
  city: { en: "City", hi: "शहर", or: "ସହର", ta: "நகரம்", te: "నగరం" },
  state: { en: "State", hi: "राज्य", or: "ରାଜ୍ୟ", ta: "மாநிலம்", te: "రాష్ట్రం" },
  pincode: { en: "PIN Code", hi: "पिन कोड", or: "ପିନ କୋଡ", ta: "பின் குறியீடு", te: "పిన్ కోడ్" },
  fatherName: { en: "Father's Name", hi: "पिता का नाम", or: "ପିତାଙ୍କ ନାମ", ta: "தந்தையின் பெயர்", te: "తండ్రి పేరు" },
  motherName: { en: "Mother's Name", hi: "माता का नाम", or: "ମାତାଙ୍କ ନାମ", ta: "தாயின் பெயர்", te: "తல్లి పేరు" },
  occupation: { en: "Occupation", hi: "पेशा", or: "ବୃତ୍ତି", ta: "தொழில்", te: "వృత్తి" },
  
  // Buttons
  next: { en: "Next", hi: "अगला", or: "ପରବର୍ତ୍ତୀ", ta: "அடுத்தது", te: "తదుపరి" },
  back: { en: "Back", hi: "पीछे", or: "ପଛକୁ", ta: "பின்னால்", te: "వెనుకకు" },
  submit: { en: "Submit", hi: "जमा करें", or: "ଦାଖଲ କରନ୍ତୁ", ta: "சமர்ப்பிக்கவும்", te: "సమర్పించండి" },
  edit: { en: "Edit", hi: "संपादित करें", or: "ସଂପାଦନ କରନ୍ତୁ", ta: "திருத்து", te: "సవరించు" },
  confirm: { en: "Confirm", hi: "पुष्टि करें", or: "ନିଶ୍ଚିତ କରନ୍ତୁ", ta: "உறுதிப்படுத்து", te: "నిర్ధారించండి" },
  download: { en: "Download PDF", hi: "PDF डाउनलोड करें", or: "PDF ଡାଉନଲୋଡ କରନ୍ତୁ", ta: "PDF பதிவிறக்கவும்", te: "PDF డౌన్‌లోడ్ చేయండి" },
  continue: { en: "Continue", hi: "जारी रखें", or: "ଜାରି ରଖନ୍ତୁ", ta: "தொடரவும்", te: "కొనసాగించు" },
  skip: { en: "Skip", hi: "छोड़ें", or: "ଛାଡନ୍ତୁ", ta: "தவிர்க்கவும்", te: "దాటవేయండి" },
  
  // Messages
  mandatory: { en: "Mandatory", hi: "अनिवार्य", or: "ବାଧ୍ୟତାମୂଳକ", ta: "கட்டாயம்", te: "తప్పనిసరి" },
  optional: { en: "Optional", hi: "वैकल्पिक", or: "ବୈକଳ୍ପିକ", ta: "விருப்பமானது", te: "ఐచ్ఛికం" },
  required: { en: "This field is required", hi: "यह फ़ील्ड आवश्यक है", or: "ଏହି କ୍ଷେତ୍ର ଆବଶ୍ୟକ", ta: "இந்த புலம் தேவை", te: "ఈ ఫీల్డ్ అవసరం" },
  reviewDetails: { en: "Review Your Details", hi: "अपना विवरण जांचें", or: "ଆପଣଙ୍କର ବିବରଣୀ ସମୀକ୍ଷା କରନ୍ତୁ", ta: "உங்கள் விவரங்களை மதிப்பாய்வு செய்யவும்", te: "మీ వివరాలను సమీక్షించండి" },
  formCompleted: { en: "Form Completed Successfully", hi: "फॉर्म सफलतापूर्वक भरा गया", or: "ଫର୍ମ ସଫଳତାର ସହିତ ସମ୍ପୂର୍ଣ୍ଣ", ta: "படிவம் வெற்றிகரமாக முடிந்தது", te: "ఫారమ్ విజయవంతంగా పూర్తయింది" },
  uploadForm: { en: "Upload Form", hi: "फॉर्म अपलोड करें", or: "ଫର୍ମ ଅପଲୋଡ କରନ୍ତୁ", ta: "படிவத்தைப் பதிவேற்றவும்", te: "ఫారమ్ అప్‌లోడ్ చేయండి" },
  uploadDocuments: { en: "Upload Documents", hi: "दस्तावेज़ अपलोड करें", or: "ଡକୁମେଣ୍ଟ ଅପଲୋଡ କରନ୍ତୁ", ta: "ஆவணங்களைப் பதிவேற்றவும்", te: "పత్రాలను అప్‌లోడ్ చేయండి" },
  processing: { en: "Processing", hi: "प्रसंस्करण", or: "ପ୍ରକ୍ରିୟାକରଣ", ta: "செயலாக்கம்", te: "ప్రాసెసింగ్" },
  previewForm: { en: "Preview Form", hi: "फॉर्म पूर्वावलोकन", or: "ଫର୍ମ ପୂର୍ବାବଲୋକନ", ta: "படிவ முன்னோட்டம்", te: "ఫారమ్ ప్రివ్యూ" },
  pleaseConfirmReview: { en: "Please confirm that you have reviewed all details", hi: "कृपया पुष्टि करें कि आपने सभी विवरण जांच लिए हैं", or: "ଦୟାକରି ନିଶ୍ଚିତ କରନ୍ତୁ ଯେ ଆପଣ ସମସ୍ତ ବିବରଣୀ ସମୀକ୍ଷା କରିଛନ୍ତି", ta: "அனைத்து விவரங்களையும் நீங்கள் மதிப்பாய்வு செய்துள்ளதை உறுதிப்படுத்தவும்", te: "దయచేసి మీరు అన్ని వివరాలను సమీక్షించినట్లు నిర్ధారించండి" },
  fillAllMandatory: { en: "Please fill all mandatory fields", hi: "कृपया सभी अनिवार्य फ़ील्ड भरें", or: "ଦୟାକରି ସମସ୍ତ ବାଧ୍ୟତାମୂଳକ କ୍ଷେତ୍ର ପୂରଣ କରନ୍ତୁ", ta: "அனைத்து கட்டாய புலங்களையும் நிரப்பவும்", te: "దయచేసి అన్ని తప్పనిసరి ఫీల్డ్‌లను పూరించండి" },
  finalized: { en: "Finalized", hi: "अंतिम रूप दिया गया", or: "ଚୂଡାନ୍ତ", ta: "இறுதி செய்யப்பட்டது", te: "ఖరారు చేయబడింది" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem("formLanguage");
    if (stored === "en" || stored === "hi" || stored === "or" || stored === "ta" || stored === "te") {
      return stored;
    }
    return "en";
  });

  const t = (key: string): string => {
    const translation = translations[key];
    if (translation && translation[language]) {
      return translation[language];
    }
    // Return the key itself if translation not found (fallback)
    return key;
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    // FIX: Save language preference for history
    localStorage.setItem("formLanguage", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}