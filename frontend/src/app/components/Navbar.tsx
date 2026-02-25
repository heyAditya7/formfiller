import { useNavigate, useLocation } from "react-router";
import { Globe, ChevronDown, Home, FileText, HelpCircle, Sparkles, History } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useLanguage, Language } from "../context/LanguageContext";

const languages = [
  { code: "en" as Language, name: "English", flag: "🇬🇧" },
  { code: "hi" as Language, name: "हिन्दी", flag: "🇮🇳" },
  { code: "or" as Language, name: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "ta" as Language, name: "தமிழ்", flag: "🇮🇳" },
  { code: "te" as Language, name: "తెలుగు", flag: "🇮🇳" },
];

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedLang = languages.find((l) => l.code === language) || languages[0];

  const handleStartNew = () => {
    // Clear any existing form data
    localStorage.removeItem("formData");
    // FIX: All start buttons lead to document upload first (consistent workflow)
    navigate("/upload-documents");
  };

  const navItems = [
    { label: t("home"), path: "/", icon: Home, action: null },
    { label: t("startNewForm"), path: "/upload-documents", icon: FileText, action: handleStartNew },
    { label: "History", path: "/history", icon: History, action: null },
    { label: t("howItWorks"), path: "/how-it-works", icon: Sparkles, action: null },
    { label: t("help"), path: "/help", icon: HelpCircle, action: null },
  ];

  return (
    <nav className="border-b border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl px-4 md:px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 group"
          id="btn_home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base md:text-lg font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              FormHelper
            </h1>
            <p className="text-xs text-gray-400">Universal Intelligence</p>
          </div>
        </button>

        {/* Navigation Items - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`text-gray-300 hover:text-white hover:bg-white/10 ${
                  isActive ? "bg-white/10 text-white" : ""
                }`}
                id={item.path === "/history" ? "btn_history" : undefined}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </div>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              id="language_switcher"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <span className="mr-2">{selectedLang.flag}</span>
              <Globe className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{selectedLang.name}</span>
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/10">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="text-white hover:bg-white/10 cursor-pointer"
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}