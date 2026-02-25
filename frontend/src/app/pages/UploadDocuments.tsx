import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  Upload,
  FileText,
  CheckCircle2,
  X,
  ArrowRight,
  CreditCard,
  IdCard,
  GraduationCap,
  Award,
  Image,
  FileImage,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { useLanguage } from "../context/LanguageContext";
import { useFormData } from "../context/FormDataContext";
import { apiUrl } from "../../config/apiConfig";

export function UploadDocuments() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    formFile,
    documentFiles: documents,
    setDocumentFiles,
    addDocumentFiles,
    removeDocumentFile,
    setExtractedData,
  } = useFormData();
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("formData");
    if (!stored || !formFile) {
      navigate("/upload-form");
    }
  }, [navigate, formFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addDocumentFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addDocumentFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleContinue = async () => {
    // Documents are OPTIONAL — skip OCR if none uploaded
    if (documents.length === 0) {
      navigate("/form");
      return;
    }
    if (!formFile) {
      navigate("/upload-form");
      return;
    }

    setProcessError(null);
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("form", formFile);
      documents.forEach((doc) => formData.append("documents", doc));
      const { data } = await axios.post<{ answers: Record<string, string>; autoFilledFields: string[] }>(
        apiUrl("/api/forms/process"),
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 }
      );
      setExtractedData({ answers: data.answers || {}, autoFilledFields: data.autoFilledFields || [] });
      const stored = JSON.parse(localStorage.getItem("formData") || "{}");
      localStorage.setItem(
        "formData",
        JSON.stringify({
          ...stored,
          answers: data.answers || {},
          autoFilledFields: data.autoFilledFields || [],
          supportingDocuments: documents.map((d) => ({ name: d.name, size: d.size })),
        })
      );
      navigate("/form");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) && err.response?.data?.error
        ? err.response.data.error
        : "Processing failed. You can still fill the form manually.";
      setProcessError(message);
    } finally {
      setProcessing(false);
    }
  };

  // FIX: Remove skip functionality - documents are mandatory for proper workflow

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-sm text-purple-300">Step 2 of 4</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Do You Have Supporting Documents?
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Upload documents with your information. Our OCR system will read them and automatically fill matching fields!
          </p>
        </motion.div>

        {/* Example Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            Examples of helpful documents:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <ExampleCard icon={<IdCard />} label="Aadhaar Card" />
            <ExampleCard icon={<CreditCard />} label="PAN Card" />
            <ExampleCard icon={<GraduationCap />} label="Marksheet" />
            <ExampleCard icon={<Award />} label="Certificates" />
            <ExampleCard icon={<Image />} label="Photos" />
            <ExampleCard icon={<FileImage />} label="Any ID" />
          </div>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${isDragging
                ? "border-purple-500 bg-purple-500/20 scale-105"
                : "border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-purple-500/5"
              }`}
          >
            <input
              type="file"
              id="documents-upload"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff,image/*"
              multiple
              className="hidden"
            />

            <label htmlFor="documents-upload" className="cursor-pointer block">
              <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Upload Supporting Documents
              </h3>
              <p className="text-gray-400 mb-4">
                Drag & drop or click to select multiple files
              </p>
              <div className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors">
                Choose Files
              </div>
            </label>
          </div>

          {/* Uploaded Documents List */}
          {documents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-8 space-y-3"
            >
              <h4 className="text-white font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Uploaded Documents ({documents.length})
              </h4>
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 px-4 py-3 bg-white/10 border border-white/20 rounded-xl group hover:border-green-500/30"
                  >
                    <FileText className="w-5 h-5 text-purple-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{doc.name}</p>
                      <p className="text-sm text-gray-400">
                        {(doc.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => removeDocumentFile(index)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Supported Formats */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400 mb-3">We support:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Photos", "PDFs", "Scanned Images", "Word Files", "Handwritten Docs"].map(
                (format) => (
                  <span
                    key={format}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300"
                  >
                    {format}
                  </span>
                )
              )}
            </div>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6"
        >
          <p className="text-gray-300 text-sm leading-relaxed text-center">
            🔒 <strong className="text-white">Privacy:</strong> Your documents are processed
            <strong className="text-white"> only</strong> to extract information using OCR.
            Nothing is stored on our servers.
          </p>
        </motion.div>

        {processError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 py-3 px-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm"
          >
            {processError}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/upload-form")}
            disabled={processing}
            className="flex-1 h-14 bg-white/5 border-white/10 hover:bg-white/10 text-white text-lg"
            id="btn_back"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={processing}
            className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-lg shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            id="btn_continue_processing"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                Continue to OCR Processing
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function ExampleCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-purple-500/30 transition-all group">
      <div className="w-10 h-10 mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-xs text-gray-300">{label}</p>
    </div>
  );
}