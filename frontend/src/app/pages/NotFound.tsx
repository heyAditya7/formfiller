import { useNavigate } from "react-router";
import { Home, FileQuestion } from "lucide-react";
import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center">
            <FileQuestion className="w-16 h-16 text-purple-400" />
          </div>

          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Button
            size="lg"
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Back Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
