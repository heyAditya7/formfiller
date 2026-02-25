import { useNavigate } from "react-router";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Upload,
  FileText,
  Brain,
  Infinity,
  Scan,
} from "lucide-react";
import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { useLanguage } from "../context/LanguageContext";

export function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleStartForm = () => {
    // Clear any previous form data
    localStorage.removeItem("formData");
    // ALL buttons go to document upload first - FIX: Consistent workflow
    navigate("/upload-documents");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <Navbar />

      {/* Hero Section - The Core Promise */}
      <section className="relative overflow-hidden px-6 py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-8">
              <Infinity className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Universal Form Intelligence
              </span>
            </div>

            {/* Main Headline - The Core Promise */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Upload{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                ANY Form.
              </span>
              <br />
              Upload{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                ANY Document.
              </span>
              <br />
              <span className="text-3xl md:text-5xl lg:text-6xl">
                We Fill It For You.
              </span>
            </h1>

            {/* Core Promise Explanation */}
            <div className="max-w-4xl mx-auto mb-10">
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <PromiseItem
                    icon={<FileText />}
                    title="ANY Form"
                    description="Government, exam, job, visa, banking, legal, medical, admission - from anywhere in the world"
                  />
                  <PromiseItem
                    icon={<Upload />}
                    title="ANY Document"
                    description="Aadhaar, PAN, certificates, marksheets, photos, PDFs, scanned images - any format"
                  />
                  <PromiseItem
                    icon={<Scan />}
                    title="Smart OCR Filling"
                    description="We read documents using OCR, extract data, match with form fields, and auto-fill everything"
                  />
                </div>
              </div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                size="lg"
                onClick={handleStartForm}
                id="btn_start_form"
                className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white px-10 py-7 text-xl rounded-2xl shadow-2xl shadow-purple-500/50 transition-all hover:shadow-purple-500/70 hover:scale-105"
              >
                <Sparkles className="w-6 h-6 mr-3" />
                Start Your Form Now
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>No limits. Any form supported.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Documents not stored</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>You control everything</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - 4 Step Process */}
      <section className="px-6 py-16 md:py-24 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300">
              A magical experience in 4 simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <WorkflowStep
              number="1"
              title="Upload Your Form"
              description="Upload the actual form you want help filling. Any format, any type, from anywhere."
              icon={<FileText />}
              gradient="from-purple-500 to-purple-700"
            />
            <WorkflowStep
              number="2"
              title="Add Documents"
              description="Upload supporting documents like ID cards, certificates with your information."
              icon={<Upload />}
              gradient="from-blue-500 to-blue-700"
            />
            <WorkflowStep
              number="3"
              title="AI OCR Processing"
              description="We use OCR to read documents, extract data, and auto-fill matching fields intelligently."
              icon={<Brain />}
              gradient="from-pink-500 to-pink-700"
            />
            <WorkflowStep
              number="4"
              title="Review & Download"
              description="Check auto-filled data, add missing details, review everything, and download PDF."
              icon={<CheckCircle2 />}
              gradient="from-green-500 to-green-700"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why This Is Different
            </h2>
            <p className="text-xl text-gray-300">
              Built without artificial limits. Designed for everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Infinity />}
              title="Truly Universal"
              description="No restrictions on form types, document formats, or languages. Upload anything."
              gradient="from-purple-500 to-purple-700"
            />
            <FeatureCard
              icon={<Scan />}
              title="Smart OCR Technology"
              description="Advanced OCR reads printed and handwritten text from photos, PDFs, and scans."
              gradient="from-blue-500 to-blue-700"
            />
            <FeatureCard
              icon={<Zap />}
              title="Auto-Skip Filled Fields"
              description="Auto-filled fields are marked and automatically skipped. You only fill what's missing."
              gradient="from-yellow-500 to-orange-600"
            />
            <FeatureCard
              icon={<Globe />}
              title="Multi-Language"
              description="Interface, explanations, and PDF output in English, Hindi, Odia, Tamil, Telugu."
              gradient="from-green-500 to-green-700"
            />
            <FeatureCard
              icon={<ShieldCheck />}
              title="100% Private"
              description="Documents processed only for form filling. Nothing stored on servers. Total privacy."
              gradient="from-indigo-500 to-indigo-700"
            />
            <FeatureCard
              icon={<CheckCircle2 />}
              title="Complete Control"
              description="Review everything before finalizing. Edit auto-filled data or add details anytime."
              gradient="from-pink-500 to-pink-700"
            />
          </div>
        </div>
      </section>

      {/* Privacy & Trust */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-3xl p-10 md:p-16 text-center"
          >
            <ShieldCheck className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Your Privacy is Absolute
            </h3>
            <div className="space-y-4 text-lg text-gray-300">
              <p>
                Your documents are <strong className="text-white">not stored</strong> on our servers.
              </p>
              <p>
                Everything is processed <strong className="text-white">only</strong> to help fill your form.
              </p>
              <p>
                You are <strong className="text-white">always in control</strong> of your data.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Upload your form and documents now. Watch the magic happen.
            </p>
            <Button
              size="lg"
              onClick={handleStartForm}
              className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white px-10 py-7 text-xl rounded-2xl shadow-2xl shadow-purple-500/50 transition-all hover:shadow-purple-500/70 hover:scale-105"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Get Started Now
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function PromiseItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center text-purple-400">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
  icon,
  gradient,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all group"
    >
      <div
        className={`absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl shadow-2xl`}
      >
        {number}
      </div>
      <div
        className={`w-14 h-14 mb-4 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all group"
    >
      <div
        className={`w-14 h-14 mb-4 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}