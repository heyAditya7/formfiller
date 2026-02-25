import type { Language } from "../context/LanguageContext";
import type { FieldTranslation } from "./formFields";

type FieldId = string;

type TranslationMap = {
  [fieldId in FieldId]?: {
    [lang in Language]?: FieldTranslation;
  };
};

/**
 * Central translation map for Info ("i") button content.
 * This keeps field help translations in one place so that
 * language changes immediately reflect across all fields.
 *
 * NOTE: When a field is missing here, the system falls back to the
 * English text defined in `formFields.ts` (meaning/writeGuide/example).
 */
export const translationMap: TranslationMap = {
  fullName: {
    hi: {
      meaning: "आधिकारिक दस्तावेज़ों (आधार, पैन, पासपोर्ट) में दिखने वाला आपका कानूनी नाम",
      writeGuide: "पहला नाम, मध्य नाम (यदि कोई), अंतिम नाम - आईडी जैसा ही लिखें",
      example: "राहुल कुमार सिंह",
    },
    ta: {
      meaning: "அதிகாரப்பூர்வ ஆவணங்களில் (ஆதார், பான், பாஸ்போர்ட்) தோன்றும் உங்கள் சட்டப் பெயர்",
      writeGuide:
        "முதல் பெயர், இடைப் பெயர் (ஏதேனும் இருந்தால்), கடைசி பெயர் - ஐடியில் உள்ளதைப் போல எழுதுங்கள்",
      example: "ராகுல் குமார் சிங்",
    },
    te: {
      meaning: "அధికారిక డాక్యుమెంట్లలో (ఆధార్, పాన్, పాస్పోర్ట్) కనిపించే మీ చట్టపరమైన పేరు",
      writeGuide:
        "మొదటి పేరు, మధ్య పేరు (ఉంటే), చివరి పేరు - IDలో ఉన్నట్లే రాయండి",
      example: "రాహుల్ కుమార్ సింగ్",
    },
  },
  dateOfBirth: {
    hi: {
      meaning: "जन्म प्रमाण पत्र या आधार में दर्ज जन्म की तारीख",
      writeGuide: "दिन/महीना/साल में डालें। साल ज़रूर जांचें!",
      example: "15/08/1990",
    },
    ta: {
      meaning: "பிறந்த சான்றிதழ் அல்லது ஆதாரில் உள்ள பிறந்த தேதி",
      writeGuide: "நாள்/மாதம்/ஆண்டு வடிவத்தில் உள்ளிடவும். ஆண்டை சரிபார்க்கவும்!",
      example: "15/08/1990",
    },
    te: {
      meaning: "పుట్టిన సర్టిఫికేట్ లేదా ఆధார்‌లో ఉన్న పుట్టిన తేదీ",
      writeGuide: "రోజు/నెల/సంవత్సరం ఫార్మాట్‌లో నమోదు చేయండి. సంవత్సరాన్ని తనిఖీ చేయండి!",
      example: "15/08/1990",
    },
  },
  address: {
    hi: {
      meaning: "आपका वर्तमान पूरा आवासीय पता जहाँ आप रहते हैं",
      writeGuide: "मकान/फ्लैट नंबर, बिल्डिंग का नाम, गली, इलाका, लैंडमार्क शामिल करें",
      example: "फ़्लैट 401, सनशाइन अपार्टमेंट, एमजी रोड, सेक्टर 12",
    },
    ta: {
      meaning: "நீங்கள் தற்போது வசிக்கும் முழு குடியிருப்பு முகவரி",
      writeGuide:
        "வீட்டு/அபார்ட்மெண்ட் எண், கட்டிடம் பெயர், தெரு, பகுதி, அடையாளக் குறி சேர்க்கவும்",
      example: "ஃபிளாட் 401, சன்ஷைன் அபார்ட்மென்ட்ஸ், எம்.ஜி. சாலை, பகுதி 12",
    },
    te: {
      meaning: "మీరు ప్రస్తుతం నివసిస్తున్న పూర్తి నివాస చిరునామా",
      writeGuide:
        "ఇల్లు/ఫ్లాట్ నంబర్, భవనం పేరు, వీధి, కాలనీ, ల్యాండ్‌మార్క్‌ను చేర్చండి",
      example: "ఫ్లాట్ 401, సన్‌ஷైన్ అపార్ట్‌మెంట్స్, ఎమ్.జి. రోడ్, సెక్టర్ 12",
    },
  },
};

