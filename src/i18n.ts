import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ru from "./locales/ru.json";

i18n
  .use(LanguageDetector) // Автоопределение языка
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    fallbackLng: "en", // Если язык браузера не найден, ставим английский
    interpolation: {
      escapeValue: false,
    },
    returnObjects: true,
  });

export default i18n;
