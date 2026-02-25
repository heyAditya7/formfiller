import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Edit2, CheckCircle2, FileText, ChevronRight, AlertTriangle, Home, Bot, User, Eye, Download } from "lucide-react";
import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { formFields } from "../data/formFields";
import { useLanguage } from "../context/LanguageContext";
import { previewPDF } from "../utils/pdfGenerator";

export function Preview() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("formData");
    if (!stored) {
      navigate("/form");
      return;
    }
    const data = JSON.parse(stored);
    setAnswers(data.answers || {});
    setAutoFilledFields(data.autoFilledFields || []);
  }, [navigate]);

  const handleEdit = () => {
    navigate("/form");
  };

  const handlePreviewPDF = () => {
    previewPDF(answers, autoFilledFields);
  };

  const handleConfirm = () => {
    // FIX: Proper validation before finalize
    if (!confirmed) {
      alert(t("pleaseConfirmReview") || "Please confirm that you have reviewed all details");
      return;
    }

    // Check if all mandatory fields are filled
    const missingMandatory = formFields.filter(
      (field) => field.mandatory && !answers[field.id]
    );

    if (missingMandatory.length > 0) {
      const missingFieldNames = missingMandatory.map((f) => t(f.id)).join(", ");
      alert(
        `${t("fillAllMandatory") || "Please fill all mandatory fields"}:\n\n${missingFieldNames}`
      );
      navigate("/form");
      return;
    }

    // FIX: Mark as finalized and save
    localStorage.setItem(
      "formData",
      JSON.stringify({
        answers,
        autoFilledFields,
        submittedAt: new Date().toISOString(),
        status: "finalized", // Mark as finalized
        confirmed: true,
      })
    );

    navigate("/success");
  };

  const filledCount = Object.keys(answers).filter((key) => answers[key]).length;
  const totalCount = formFields.length;
  const mandatoryCount = formFields.filter((f) => f.mandatory).length;
  const filledMandatory = formFields.filter(
    (f) => f.mandatory && answers[f.id]
  ).length;
  const completionPercentage = Math.round((filledCount / totalCount) * 100);
  const autoFilledCount = autoFilledFields.length;
  const manualFilledCount = filledCount - autoFilledCount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300">
              {completionPercentage}% Complete
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t("reviewDetails")}
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            Please verify all information before final submission
          </p>

          {/* Preview Button */}
          <Button
            onClick={handlePreviewPDF}
            variant="outline"
            className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 hover:border-purple-500/50 text-purple-300 hover:text-purple-200"
            id="btn_preview_pdf"
          >
            <Eye className="w-4 h-4 mr-2" />
            {t("previewForm")} (PDF)
          </Button>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{autoFilledCount}</p>
              <p className="text-sm text-gray-400">Auto-filled (OCR)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">{manualFilledCount}</p>
              <p className="text-sm text-gray-400">Manually filled</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${filledMandatory === mandatoryCount ? "text-green-400" : "text-red-400"}`}>
                {filledMandatory}/{mandatoryCount}
              </p>
              <p className="text-sm text-gray-400">Mandatory</p>
            </div>
          </div>

          {filledMandatory < mandatoryCount && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 max-w-2xl mx-auto"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm text-left">
                You have {mandatoryCount - filledMandatory} mandatory field(s) remaining. Please fill all mandatory fields before submitting.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Complete Form Preview</h2>
                  <p className="text-sm text-gray-400">Read-only view - All {totalCount} fields</p>
                </div>
              </div>
              <Button
                onClick={handlePreviewPDF}
                size="sm"
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Preview PDF
              </Button>
            </div>
          </div>

          {/* Card Body - ALL Fields */}
          <div className="p-6 md:p-8">
            <div className="space-y-1">
              {formFields.map((field, index) => {
                const value = answers[field.id];
                const isEmpty = !value;
                const isMandatory = field.mandatory;
                const isAutoFilled = autoFilledFields.includes(field.id);

                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`p-4 rounded-xl border transition-all ${isEmpty && isMandatory
                      ? "bg-red-500/5 border-red-500/20"
                      : isEmpty
                        ? "bg-yellow-500/5 border-yellow-500/20"
                        : isAutoFilled
                          ? "bg-green-500/5 border-green-500/20 hover:border-green-500/30"
                          : "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/30"
                      }`}
                    id={`preview_${field.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-xs font-semibold text-gray-400 uppercase">
                            {t(field.id)}
                          </p>
                          {isMandatory && (
                            <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300">
                              {t("mandatory")}
                            </span>
                          )}
                          {!isEmpty && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${isAutoFilled
                              ? "bg-green-500/20 border border-green-500/30"
                              : "bg-blue-500/20 border border-blue-500/30"
                              }`}>
                              {isAutoFilled ? (
                                <>
                                  <Bot className="w-3 h-3 text-green-400" />
                                  <span className="text-green-400">Auto (OCR)</span>
                                </>
                              ) : (
                                <>
                                  <User className="w-3 h-3 text-blue-400" />
                                  <span className="text-blue-400">Manual</span>
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        {isEmpty ? (
                          <p className={`italic text-sm ${isMandatory ? "text-red-400" : "text-yellow-400"}`}>
                            {isMandatory ? "Not filled (Required)" : "Not filled (Optional)"}
                          </p>
                        ) : (
                          <p className="text-white text-lg font-medium break-words">
                            {value}
                          </p>
                        )}
                      </div>
                      {!isEmpty && (
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-1 ${isAutoFilled ? "text-green-500" : "text-blue-500"
                          }`} />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Confirmation Checkbox */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="confirm_checkbox"
                  checked={confirmed}
                  onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                  className="mt-1"
                />
                <label
                  htmlFor="confirm_checkbox"
                  className="text-white cursor-pointer select-none"
                >
                  <p className="font-semibold mb-1">
                    I have reviewed all details and confirm they are correct
                  </p>
                  <p className="text-sm text-gray-400">
                    Please verify all information carefully, especially auto-filled fields from OCR,
                    before proceeding to final submission.
                  </p>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
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
                onClick={handleEdit}
                className="flex-1 h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white"
                id="btn_edit"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {t("edit")} Form
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!confirmed || filledMandatory < mandatoryCount}
                className="flex-1 h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                id="btn_submit"
              >
                {t("confirm")} & Final Submit
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
        >
          <p className="text-sm text-blue-300 text-center">
            💡 Click "Preview Form (PDF)" to see how your filled form will look as a professional document
          </p>
        </motion.div>
      </div>
    </div>
  );
}