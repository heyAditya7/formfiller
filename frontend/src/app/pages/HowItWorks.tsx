import { useNavigate } from "react-router";
import {
  Upload,
  FileText,
  Brain,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";

export function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Universal Form Helper uses advanced AI to make form-filling effortless. 
            Here's exactly how the magic happens.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-12">
          <Step
            number="1"
            title="Upload Your Form"
            description="Start by uploading the actual form you need to fill. This could be any government form, job application, exam form, visa application, or any other official document. We support PDF, Word documents, images, and even scanned forms."
            icon={<FileText />}
            gradient="from-purple-500 to-purple-700"
            details={[
              "Supported formats: PDF, DOC, DOCX, JPG, PNG, and more",
              "Any form type: government, banking, exam, job, visa, etc.",
              "Works with scanned or digital forms",
            ]}
          />

          <Step
            number="2"
            title="Add Supporting Documents (Optional)"
            description="Upload any documents that contain information needed for the form. The more documents you provide, the more fields we can auto-fill for you. This step is completely optional - you can skip it and fill everything manually if you prefer."
            icon={<Upload />}
            gradient="from-blue-500 to-blue-700"
            details={[
              "ID cards: Aadhaar, PAN, passport, driver's license",
              "Educational documents: marksheets, certificates, degrees",
              "Professional documents: resume, experience letters",
              "Any photos, PDFs, or Word files with your information",
            ]}
          />

          <Step
            number="3"
            title="AI Processing Magic"
            description="Our intelligent system reads and understands both your form and your documents. It identifies what information is needed, extracts relevant details from your documents, and matches them to the correct form fields. This happens in seconds!"
            icon={<Brain />}
            gradient="from-pink-500 to-pink-700"
            details={[
              "Understands form structure and required fields",
              "Reads text from photos and scanned documents",
              "Intelligently matches document data to form fields",
              "Only auto-fills when confident about accuracy",
            ]}
          />

          <Step
            number="4"
            title="Review & Download"
            description="You'll see all auto-filled fields clearly marked. Review everything, add any missing information, and make edits if needed. Once you're satisfied, download your perfectly filled form as a professional PDF ready for submission."
            icon={<CheckCircle2 />}
            gradient="from-green-500 to-green-700"
            details={[
              "Auto-filled fields clearly distinguished",
              "Easy editing and correction",
              "Step-by-step guidance for manual fields",
              "Download as professional PDF",
            ]}
          />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Try It?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience the future of form-filling. Upload your form now and see the magic happen!
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/upload-form")}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-10 py-6 text-lg shadow-2xl shadow-purple-500/50"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Your Form Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
  icon,
  gradient,
  details,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  details: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Number Badge */}
        <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-2xl shadow-2xl`}>
          {number}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
              {icon}
            </div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
          </div>
          
          <p className="text-gray-300 text-lg mb-4 leading-relaxed">
            {description}
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <ul className="space-y-2">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-400">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
