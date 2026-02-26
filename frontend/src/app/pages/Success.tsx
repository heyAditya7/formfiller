import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, Download, Printer, Home, FileCheck, Eye } from "lucide-react";
import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { useLanguage } from "../context/LanguageContext";
import { generateAndDownloadPDF, previewPDF, downloadPDF } from "../utils/pdfGenerator";
import { apiUrl, apiHeaders } from "../../config/apiConfig";

export function Success() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);
  const [isFinalized, setIsFinalized] = useState(false);
  const hasSaved = useRef(false);

  useEffect(() => {
    if (hasSaved.current) return;

    const stored = localStorage.getItem("formData");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setAnswers(data.answers || {});
        setAutoFilledFields(data.autoFilledFields || []);
        setIsFinalized(data.status === "finalized");

        if (data.status === "finalized" && data.confirmed) {
          hasSaved.current = true;
          saveToHistory(data);
        }
      } catch (err) {
        console.error("Error parsing form data:", err);
      }
    }
  }, []);

  /** Save to API (MongoDB) + localStorage - try-catch for Server Offline */
  const saveToHistory = async (data: any) => {
    const draftId = localStorage.getItem("draftFormId");
    const submission = {
      formName: "Registration Form",
      status: "finalized",
      language: localStorage.getItem("formLanguage") || "en",
      answers: data.answers || {},
      autoFilledFields: data.autoFilledFields || [],
      submittedAt: data.submittedAt || new Date().toISOString(),
    };

    try {
      const url = draftId ? apiUrl(`/api/forms/${draftId}`) : apiUrl("/api/forms");
      const method = draftId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: apiHeaders,
        body: JSON.stringify(submission),
      });

      if (res.ok && draftId) {
        // Clear draft ID once it's finalized and synced
        localStorage.removeItem("draftFormId");
      }
    } catch (_) {
      // Server offline - sync handled by local history
    }

    // Update local history
    const historyData = localStorage.getItem("formHistory");
    const history = historyData ? JSON.parse(historyData) : [];

    // Use a unique enough ID for local tracking
    const localId = draftId || submission.submittedAt;
    const exists = history.some((item: any) =>
      (item._id && item._id === draftId) || (item.id === localId)
    );

    if (!exists) {
      history.unshift({
        ...submission,
        id: localId,
        _id: draftId,
        dateFilled: submission.submittedAt
      });
      localStorage.setItem("formHistory", JSON.stringify(history));
    } else {
      // Update existing local record if found
      const idx = history.findIndex((item: any) =>
        (item._id && item._id === draftId) || (item.id === localId)
      );
      if (idx !== -1) {
        history[idx] = {
          ...history[idx],
          ...submission,
          status: "finalized",
          dateFilled: submission.submittedAt
        };
        localStorage.setItem("formHistory", JSON.stringify(history));
      }
    }
  };

  const handleFinish = () => {
    // Clear saved form data
    localStorage.removeItem("formData");
    localStorage.removeItem("draftFormId");
    // Return to home
    navigate("/");
  };

  const handleDownload = () => {
    generateAndDownloadPDF(answers, autoFilledFields).catch(() => {
      downloadPDF(answers, autoFilledFields);
    });
  };

  const handlePreview = () => {
    previewPDF(answers, autoFilledFields);
  };

  const handlePrint = () => {
    downloadPDF(answers, autoFilledFields);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Success Icon Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="inline-flex mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-green-500/30 blur-2xl"
              />

              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-2xl shadow-green-500/50">
                <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>

          {/* FIX: Finalized Badge */}
          {isFinalized && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 mb-4"
            >
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">
                {t("finalized")}
              </span>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t("formCompleted")} 🎉
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Your details have been saved safely.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              You can now download, print, or submit your form.
            </p>
          </motion.div>

          {/* Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            <ActionCard
              icon={<Download />}
              title={t("download")}
              description="Get your filled form as PDF"
              onClick={handleDownload}
              gradient="from-blue-500 to-blue-700"
            />
            <ActionCard
              icon={<Printer />}
              title="Print Form"
              description="Print a physical copy"
              onClick={handlePrint}
              gradient="from-purple-500 to-purple-700"
            />
            <ActionCard
              icon={<Eye />}
              title="Preview Form"
              description="View your filled form"
              onClick={handlePreview}
              gradient="from-cyan-500 to-cyan-700"
            />
          </motion.div>

          {/* Main Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 max-w-md mx-auto"
          >
            <Button
              size="lg"
              onClick={handleDownload}
              id="btn_download_pdf"
              className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/30 text-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              {t("download")}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleFinish}
              className="w-full h-14 bg-white/5 border-white/10 hover:bg-white/10 text-white text-lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Fill Another Form
            </Button>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/20 rounded-2xl p-8"
          >
            <div className="flex items-start gap-4 text-left">
              <FileCheck className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  What's Next?
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Download the PDF and review all details carefully</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Print if required for physical submission</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Submit online or in person as per instructions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Keep a copy for your records</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Thank You Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-gray-400"
          >
            Thank you for using FormHelper! We made form-filling easy for you. 💜
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  onClick,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  gradient: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-left hover:border-purple-500/30 transition-all group"
    >
      <div
        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
      >
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </motion.button>
  );
}