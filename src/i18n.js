import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "./locales/en/translation.json";
import arTranslation from "./locales/ar/translation.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  ar: {
    translation: arTranslation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "ar"],
    simplifyPluralSuffix: true,
    interpolation: {
      escapeValue: false, // React already safe from xss
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

// Custom pluralizer removed since standard i18next v21+ JSONv4 handles Arabic natively

// Handle RTL/LTR document direction dynamically
i18n.on("languageChanged", (lng) => {
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  // Robustly ensure persistence
  localStorage.setItem("i18nextLng", lng);
});

// Initialize direction immediately based on current language
const storedLng = localStorage.getItem("i18nextLng");
const currentLng = storedLng || i18n.language || "en";

if (storedLng !== currentLng) {
  localStorage.setItem("i18nextLng", currentLng);
}

document.documentElement.dir = currentLng === "ar" ? "rtl" : "ltr";
document.documentElement.lang = currentLng;

export default i18n;
