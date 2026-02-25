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

// Override plural rules to use a simplified 3-form for Arabic (_zero, _few, _many)
if (i18n.services && i18n.services.pluralResolver) {
  i18n.services.pluralResolver.addRule("ar", {
    numbers: [0, 1, 2],
    plurals: function (n) {
      if (n === 0 || n === 1) return 0; // mapped to _zero / _one
      if (n >= 2 && n <= 10) return 1; // mapped to _few
      return 2; // mapped to _many / _other
    },
  });
}

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
