import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Info, ChevronLeft, ChevronRight, Sparkles, AlertCircle, Home, Bot, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { formFields as staticFormFields, FormField, getFieldInfoForLanguage } from "../data/formFields";
import { useLanguage } from "../context/LanguageContext";
import { useFormData } from "../context/FormDataContext";
import { apiUrl, apiHeaders } from "../../config/apiConfig";

/** Smart form state - 18 se 100+ fields auto-support, logic same rahega */
type FormState = { [key: string]: any };

export function FormFill() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { extractedData, clearExtractedData } = useFormData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fields, setFields] = useState<FormField[]>([]);
  const [answers, setAnswers] = useState<FormState>({});
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Load dynamic schema from localStorage (set by UploadDocuments after OCR)
  // Falls back to static formFields so manual fill always works
  useEffect(() => {
    const storedSchema = localStorage.getItem("dynamicFields");
    if (storedSchema) {
      try {
        const parsed: FormField[] = JSON.parse(storedSchema);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Deduplicate by id
          const unique = parsed.filter(
            (f, i, arr) => i === arr.findIndex((x) => x.id === f.id)
          );
          setFields(unique);
          return;
        }
      } catch (_) { }
    }
    setFields(staticFormFields);
  }, []);

  useEffect(() => {
    if (extractedData) {
      // New session via document upload — reset draft ID so a fresh record is created
      localStorage.removeItem("draftFormId");
      setAnswers((prev) => ({ ...prev, ...extractedData.answers }));
      setAutoFilledFields(extractedData.autoFilledFields);
      const stored = localStorage.getItem("formData");
      const existing = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        "formData",
        JSON.stringify({
          ...existing,
          answers: { ...(existing.answers || {}), ...extractedData.answers },
          autoFilledFields: extractedData.autoFilledFields,
          timestamp: new Date().toISOString(),
          status: "draft",
        })
      );
      clearExtractedData();
      return;
    }
    const stored = localStorage.getItem("formData");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setAnswers((data.answers && typeof data.answers === "object") ? data.answers : {});
        setAutoFilledFields(Array.isArray(data.autoFilledFields) ? data.autoFilledFields : []);
        if (Array.isArray(data.autoFilledFields) && data.autoFilledFields.length > 0) {
          const firstManualIndex = fields.findIndex(
            (field) => !data.autoFilledFields.includes(field.id)
          );
          if (firstManualIndex !== -1) setCurrentIndex(firstManualIndex);
        }
      } catch (_) {
        setAnswers({});
        setAutoFilledFields([]);
      }
    }
  }, [extractedData, clearExtractedData]);

  // Crash guard — wait until fields are loaded
  if (!fields.length) return null;

  const currentField = fields[currentIndex] ?? fields[0];
  const currentValue = String(answers[currentField.id] ?? "");
  const totalFields = fields.length;
  const filledCount = Object.keys(answers).filter((key) => answers[key] != null && answers[key] !== "").length;
  const progress = totalFields > 0 ? (filledCount / totalFields) * 100 : 0;
  const isAutoFilled = autoFilledFields.includes(currentField.id);

  /** Validate single field - mandatory & custom validation */
  const validateField = (fieldId: string, value: string): string | null => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return null;

    if (field.mandatory && !value.trim()) {
      return t("required");
    }

    if (field.validation && value.trim()) {
      return field.validation(value);
    }

    return null;
  };

  const findNextManualField = (fromIndex: number): number => {
    for (let i = fromIndex + 1; i < fields.length; i++) {
      if (!autoFilledFields.includes(fields[i].id)) {
        return i;
      }
    }
    return -1;
  };

  const findPrevManualField = (fromIndex: number): number => {
    for (let i = fromIndex - 1; i >= 0; i--) {
      if (!autoFilledFields.includes(fields[i].id)) {
        return i;
      }
    }
    return -1;
  };

  const handleInputChange = (value: string) => {
    const updatedAnswers: FormState = {
      ...answers,
      [currentField.id]: value,
    };
    setAnswers(updatedAnswers);

    // Validate current field
    if (touched[currentField.id]) {
      const error = validateField(currentField.id, value);
      setErrors({
        ...errors,
        [currentField.id]: error || "",
      });
    }
  };

  const handleNext = async () => {
    // If auto-filled, just skip to next
    if (isAutoFilled) {
      const nextIndex = findNextManualField(currentIndex);
      if (nextIndex === -1) {
        navigate("/preview");
      } else {
        setCurrentIndex(nextIndex);
      }
      return;
    }

    // Mark field as touched
    setTouched({
      ...touched,
      [currentField.id]: true,
    });

    // Validate current field
    const error = validateField(currentField.id, currentValue);
    if (error) {
      setErrors({
        ...errors,
        [currentField.id]: error,
      });
      return;
    }

    // Local storage - hamesha save (offline support)
    const payload = {
      answers,
      autoFilledFields,
      timestamp: new Date().toISOString(),
      status: "draft",
    };
    localStorage.setItem("formData", JSON.stringify(payload));

    // API save (draft) - skip if already saved this session (prevent duplicates)
    setApiError(null);
    const existingDraftId = localStorage.getItem("draftFormId");
    if (!existingDraftId) {
      try {
        const res = await fetch(apiUrl("/api/forms"), {
          method: "POST",
          headers: apiHeaders,
          body: JSON.stringify({
            formName: "Registration Form",
            status: "draft",
            language: localStorage.getItem("formLanguage") || "en",
            answers,
            autoFilledFields,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
        const saved = await res.json();
        // Mark this draft so we don't create duplicates on subsequent Next clicks
        if (saved?._id) localStorage.setItem("draftFormId", saved._id);
      } catch (err) {
        setApiError("Server offline? Saved locally. We'll sync when back.");
      }
    }

    // Move to next manual field or review
    const nextIndex = findNextManualField(currentIndex);
    if (nextIndex === -1) {
      navigate("/preview");
    } else {
      setCurrentIndex(nextIndex);
      setShowInfo(false);
    }
  };

  const handlePrev = () => {
    const prevIndex = findPrevManualField(currentIndex);
    if (prevIndex !== -1) {
      setCurrentIndex(prevIndex);
      setShowInfo(false);
    }
  };

  const currentError = errors[currentField.id];
  const manualFieldsCount = fields.filter((f) => !autoFilledFields.includes(f.id)).length;
  const manualFieldsRemaining = fields.filter(
    (f) => !autoFilledFields.includes(f.id) && !answers[f.id]
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
        {/* API offline hint - Server Offline / Network Error handled */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 py-2 px-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-sm"
          >
            {apiError}
          </motion.div>
        )}

        {/* Auto-Fill Success Banner */}
        {autoFilledFields.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-300 font-semibold">
                  🎉 We've auto-filled {autoFilledFields.length} fields from your documents!
                </p>
                <p className="text-sm text-gray-400">
                  We handled most of this for you. Just {manualFieldsRemaining} questions left!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-400">
              Field <span className="text-purple-400 font-semibold">{currentIndex + 1}</span> of {totalFields}
            </p>
            <p className="text-sm text-gray-400">
              <span className="text-purple-400 font-semibold">{Math.round(progress)}%</span> Complete
            </p>
          </div>
          <Progress value={progress} className="h-2 bg-white/10" />
        </motion.div>

        {/* Main Form Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden ${isAutoFilled ? "border-green-500/30" : "border-white/10"
              }`}
          >
            {/* Card Header */}
            <div className={`border-b border-white/10 p-6 ${isAutoFilled
              ? "bg-gradient-to-r from-green-600/20 to-green-700/20"
              : "bg-gradient-to-r from-purple-600/20 to-purple-700/20"
              }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {isAutoFilled && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full mb-3">
                      <Bot className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-300 font-medium">
                        Filled from your document
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <Label htmlFor={`input_${currentField.id}`} className="text-xl md:text-2xl text-white">
                      {t(currentField.id)}
                    </Label>
                    {currentField.mandatory && (
                      <span className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300 font-medium">
                        {t("mandatory")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    {isAutoFilled
                      ? "This was automatically filled from your documents. Verify it's correct."
                      : "Fill this field carefully. Need help? Click the info button →"
                    }
                  </p>
                </div>
                <Button
                  onClick={() => setShowInfo(!showInfo)}
                  variant="outline"
                  size="sm"
                  className={`bg-white/5 border-white/10 hover:bg-white/10 text-white flex-shrink-0 ${showInfo ? "bg-purple-500/20 border-purple-500/30" : ""
                    }`}
                >
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 md:p-8">
              {/* Input Field */}
              <div className="mb-6">
                <Input
                  id={`input_${currentField.id}`}
                  type={currentField.type || "text"}
                  placeholder={currentField.placeholder}
                  value={currentValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onBlur={() => {
                    setTouched({ ...touched, [currentField.id]: true });
                    const error = validateField(currentField.id, currentValue);
                    if (error) {
                      setErrors({ ...errors, [currentField.id]: error });
                    }
                  }}
                  readOnly={isAutoFilled}
                  className={`text-lg h-14 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-500 ${isAutoFilled
                    ? "bg-green-500/10 border-green-500/30 cursor-default"
                    : "bg-white/5"
                    } ${currentError && touched[currentField.id] ? "border-red-500 focus:border-red-500" : ""}`}
                />

                {/* Error Message */}
                {currentError && touched[currentField.id] && !isAutoFilled && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-start gap-2 text-red-400 text-sm"
                    id={`validation_error_${currentField.id}`}
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{currentError}</span>
                  </motion.div>
                )}
              </div>

              {/* Info Box - translated meaning/writeGuide/example (Hindi, Tamil, Telugu, etc.) */}
              <AnimatePresence>
                {showInfo && (() => {
                  const info = getFieldInfoForLanguage(currentField, language);
                  return (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 overflow-hidden"
                    >
                      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5 space-y-3">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-blue-400 uppercase mb-1">
                              Why is this asked?
                            </p>
                            <p className="text-gray-300 leading-relaxed">
                              {info.meaning}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-purple-400 uppercase mb-1">
                              What exactly to write
                            </p>
                            <p className="text-gray-300 leading-relaxed">
                              {info.writeGuide}
                            </p>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                            Example
                          </p>
                          <p className="text-white font-medium">{info.example}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                  id="btn_home"
                >
                  <Home className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={findPrevManualField(currentIndex) === -1}
                  className="flex-1 h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white disabled:opacity-30"
                  id="btn_previous"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {t("back")}
                </Button>
                <Button
                  onClick={handleNext}
                  className={`flex-1 h-12 shadow-lg ${isAutoFilled
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-green-500/30"
                    : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-purple-500/30"
                    }`}
                  id="btn_next"
                >
                  {findNextManualField(currentIndex) === -1 ? (
                    "Review Answers"
                  ) : (
                    <>
                      {isAutoFilled ? "Skip to Next" : t("next")}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Field Indicators */}
        <div className="mt-8 flex justify-center gap-2 flex-wrap">
          {fields.map((field, index) => {
            const isComplete = !!answers[field.id];
            const isCurrent = index === currentIndex;
            const isAuto = autoFilledFields.includes(field.id);

            return (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${isCurrent
                  ? "w-8 bg-purple-500"
                  : isComplete
                    ? isAuto
                      ? "w-2 bg-green-500"
                      : "w-2 bg-blue-500"
                    : "w-2 bg-white/20"
                  }`}
              />
            );
          })}
        </div>

        {/* Reassurance Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-400">
            🔒 Your information is secure and used only for filling this form
          </p>
        </motion.div>
      </div>
    </div>
  );
}
