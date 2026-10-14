import React from "react";
import { Languages, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface LanguageSwitcherProps {
  variant?: "pill" | "button" | "dropdown";
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
}) => {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* 2-Option Pill Switcher */}
      <div className="flex items-center p-1 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-sm">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center gap-1 ${
            language === "en"
              ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60 font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
          title="Switch to English"
          aria-label="Switch to English"
        >
          <span>EN</span>
          {language === "en" && <Check className="w-3 h-3 text-emerald-500" />}
        </button>

        <button
          type="button"
          onClick={() => setLanguage("am")}
          className={`px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center gap-1 font-amharic ${
            language === "am"
              ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60 font-black"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
          title="ወደ አማርኛ ቀይር (Switch to Amharic)"
          aria-label="ወደ አማርኛ ቀይር"
        >
          <span>አማ</span>
          {language === "am" && <Check className="w-3 h-3 text-emerald-500" />}
        </button>
      </div>
    </div>
  );
};
