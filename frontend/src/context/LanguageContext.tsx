import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, type Language } from "../i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to look up dot-delimited key in translation dictionary
function getNestedTranslation(obj: any, path: string): string | null {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      return null;
    }
    current = current[part];
  }
  return typeof current === "string" ? current : null;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("unique_low_language");
    if (saved === "en" || saved === "am") {
      return saved;
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("unique_low_language", language);
    // Set document lang attribute for accessibility
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === "en" ? "am" : "en"));
  };

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    // 1. Try currently selected language
    let result = getNestedTranslation(translations[language], key);

    // 2. Fall back to English if missing
    if (!result && language !== "en") {
      result = getNestedTranslation(translations["en"], key);
    }

    // 3. Fall back to key itself
    if (!result) {
      result = key;
    }

    // 4. Interpolate {param} variables
    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        result = (result as string).replace(
          new RegExp(`\\{${paramKey}\\}`, "g"),
          String(val)
        );
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Convenient alias
export const useTranslation = useLanguage;
