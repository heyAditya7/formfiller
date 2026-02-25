import { useNavigate } from "react-router";
import {
  HelpCircle,
  FileText,
  Upload,
  Shield,
  Globe,
  Mail,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";

export function Help() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <HelpCircle className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Help & FAQs
          </h1>
          <p className="text-xl text-gray-300">
            Get answers to common questions about Universal Form Helper
          </p>
        </motion.div>

        <div className="space-y-6">
          <FAQItem
            question="What types of forms are supported?"
            answer="We support ALL types of forms without any restrictions - government forms, exam applications, job applications, visa forms, banking forms, medical forms, admission forms, legal documents, and more. If it's a form that needs filling, we can help."
            icon={<FileText />}
          />

          <FAQItem
            question="What document formats can I upload?"
            answer="We accept ANY format: PDF files, Word documents (DOC, DOCX), images (JPG, PNG, GIF), scanned documents, handwritten forms, and more. Both your form and supporting documents can be in any of these formats."
            icon={<Upload />}
          />

          <FAQItem
            question="Is my personal information safe?"
            answer="Absolutely! Your documents are processed ONLY to help fill your form. Nothing is stored on our servers. We use secure processing to extract information, and all data is immediately discarded after you download your filled form. Your privacy is our top priority."
            icon={<Shield />}
          />

          <FAQItem
            question="Can I use this in my native language?"
            answer="Yes! The interface is available in multiple languages including English, Hindi, Odia, Bengali, Tamil, and more. Field explanations and helper text are also translated to help you understand exactly what each form field requires."
            icon={<Globe />}
          />

          <FAQItem
            question="What if I don't have supporting documents?"
            answer="No problem! You can skip the document upload step and fill the form manually. The system will guide you step-by-step through each field with clear explanations, examples, and validation to ensure you fill it correctly."
            icon={<FileText />}
          />

          <FAQItem
            question="How accurate is the auto-fill feature?"
            answer="Our AI is highly accurate, but we always recommend reviewing all auto-filled fields. Auto-filled fields are clearly marked so you can verify and edit them if needed. The system only auto-fills when it's confident about the accuracy."
            icon={<HelpCircle />}
          />

          <FAQItem
            question="Can I edit auto-filled information?"
            answer="Yes! You have complete control. All auto-filled fields can be edited, corrected, or changed at any time. During the review stage, you can verify everything before finalizing your form."
            icon={<FileText />}
          />

          <FAQItem
            question="Still need help?"
            answer="We're here to help! Contact our support team for personalized assistance."
            icon={<Mail />}
            isContact
          />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-3xl p-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-300 mb-6">
              Start filling your form now - it's fast, easy, and secure!
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/upload-form")}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-8 py-6 text-lg shadow-2xl shadow-purple-500/50"
            >
              Upload Your Form
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FAQItem({
  question,
  answer,
  icon,
  isContact,
}: {
  question: string;
  answer: string;
  icon: React.ReactNode;
  isContact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">{question}</h3>
          <p className="text-gray-300 leading-relaxed">{answer}</p>
          {isContact && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
