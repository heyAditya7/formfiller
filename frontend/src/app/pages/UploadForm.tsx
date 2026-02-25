import { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, FileText, CheckCircle2, X, ArrowRight, Home } from "lucide-react";
import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { useLanguage } from "../context/LanguageContext";
import { useFormData } from "../context/FormDataContext";

export function UploadForm() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setFormFile } = useFormData();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleContinue = () => {
    if (!selectedFile) return;

    setFormFile(selectedFile);
    localStorage.setItem(
      "formData",
      JSON.stringify({
        formFile: selectedFile.name,
        formFileSize: selectedFile.size,
        uploadedAt: new Date().toISOString(),
        supportingDocuments: [],
        answers: {},
        autoFilledFields: [],
      })
    );
    navigate("/upload-documents");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-sm text-purple-300">Step 1 of 4</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Upload the Form You Want Help Filling
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            This is the actual form you need to complete. We support any format - PDF, images, Word documents, or scanned files.
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 md:p-16 text-center transition-all ${
              isDragging
                ? "border-purple-500 bg-purple-500/20 scale-105"
                : selectedFile
                ? "border-green-500/50 bg-green-500/10"
                : "border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-purple-500/5"
            }`}
          >
            <input
              type="file"
              id="form-upload"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff,image/*"
              className="hidden"
            />

            {!selectedFile ? (
              <label htmlFor="form-upload" className="cursor-pointer block">
                <Upload className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">
                  Drag & Drop Your Form Here
                </h3>
                <p className="text-gray-400 mb-6">or click to browse files</p>
                <div className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors">
                  Choose File
                </div>
              </label>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto" />
                <h3 className="text-2xl font-bold text-white">Form Uploaded!</h3>
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/10 border border-white/20 rounded-xl">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFile(null);
                    }}
                    className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Supported Formats */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400 mb-3">Supported formats:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["PDF", "DOC", "DOCX", "JPG", "PNG", "Scanned Images"].map((format) => (
                <span
                  key={format}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300"
                >
                  {format}
                </span>
              ))}
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
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            What happens next?
          </h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            After uploading your form, you'll be able to add supporting documents (like Aadhaar card, PAN card, certificates, etc.). 
            Our OCR system will read those documents and automatically fill matching fields in your form!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex-1 h-14 bg-white/5 border-white/10 hover:bg-white/10 text-white text-lg"
            id="btn_back_home"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedFile}
            className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-lg shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            id="btn_continue_documents"
          >
            Continue to Next Step
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
