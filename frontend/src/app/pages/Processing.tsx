import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Brain, FileSearch, Sparkles, CheckCircle2, Zap, Scan } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

const processingSteps = [
  {
    icon: <FileSearch />,
    message: "Understanding your form structure...",
    description: "Analyzing form layout and identifying required fields",
  },
  {
    icon: <Scan />,
    message: "Reading your documents using OCR...",
    description: "Extracting text from photos, PDFs, and scanned images",
  },
  {
    icon: <Brain />,
    message: "Matching details with form fields...",
    description: "Intelligently mapping document data to form requirements",
  },
  {
    icon: <Sparkles />,
    message: "Auto-filling detected information...",
    description: "Preparing your form with extracted data",
  },
];

export function Processing() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if form data exists
    const stored = localStorage.getItem("formData");
    if (!stored) {
      navigate("/upload-form");
      return;
    }

    const data = JSON.parse(stored);
    const hasDocuments = data.supportingDocuments && data.supportingDocuments.length > 0;

    // Simulate OCR processing with realistic timing
    const stepDuration = 2500;
    const totalSteps = processingSteps.length;

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < totalSteps - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return Math.min(prev + 1, 100);
        }
        return prev;
      });
    }, (stepDuration * totalSteps) / 100);

    // Complete processing and navigate
    const completeTimer = setTimeout(() => {
      // Simulate OCR auto-filled fields if documents were uploaded
      if (hasDocuments) {
        // These fields would be filled by actual OCR in production
        const ocrAutoFilledAnswers: Record<string, string> = {
          fullName: "Rahul Kumar Singh",
          email: "rahul.kumar@gmail.com",
          phoneNumber: "9876543210",
          aadhaar: "1234 5678 9012",
          address: "Flat 401, Sunshine Apartments, MG Road",
          city: "Bhubaneswar",
          state: "Odisha",
          pincode: "751024",
        };

        const updatedData = {
          ...data,
          answers: ocrAutoFilledAnswers,
          autoFilledFields: Object.keys(ocrAutoFilledAnswers),
        };

        localStorage.setItem("formData", JSON.stringify(updatedData));
      }

      navigate("/form");
    }, stepDuration * totalSteps + 500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center">
          {/* Animated OCR/AI Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="relative inline-block mb-12"
          >
            {/* Outer rotating rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0"
            >
              <div className="w-40 h-40 rounded-full border-2 border-purple-500/30 border-t-purple-500" />
            </motion.div>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-2"
            >
              <div className="w-36 h-36 rounded-full border-2 border-blue-500/30 border-b-blue-500" />
            </motion.div>

            {/* Center icon */}
            <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Scan className="w-20 h-20 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Step Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              AI OCR Processing
            </h1>
            <p className="text-lg text-gray-400">
              Reading your documents and auto-filling your form...
            </p>
          </motion.div>

          {/* Current Step */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="inline-flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center text-purple-400">
                  {processingSteps[currentStep].icon}
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {processingSteps[currentStep].message}
              </h2>
              <p className="text-lg text-gray-400">
                {processingSteps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">Processing...</span>
              <span className="text-sm text-purple-400 font-semibold">
                {progress}%
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 rounded-full"
              />
            </div>
          </div>

          {/* Processing Steps Indicator */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
            {processingSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: index <= currentStep ? 1 : 0.4,
                  scale: index === currentStep ? 1.1 : 1,
                }}
                className={`p-4 rounded-xl border transition-all ${
                  index < currentStep
                    ? "bg-green-500/10 border-green-500/30"
                    : index === currentStep
                    ? "bg-purple-500/20 border-purple-500/50"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="mb-2">
                  {index < currentStep ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto" />
                  ) : (
                    <div className="text-purple-400 mx-auto w-6 h-6 flex items-center justify-center">
                      {step.icon}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-300 line-clamp-2">
                  {step.message}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Reassurance Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="max-w-2xl mx-auto bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6"
          >
            <p className="text-blue-300 text-sm leading-relaxed">
              🔒 <strong>Privacy Note:</strong> We are only reading the documents you
              provided to help fill this form. Your data is processed securely and is
              not stored on our servers.
            </p>
          </motion.div>

          {/* Pulsing dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex justify-center gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-purple-500"
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
