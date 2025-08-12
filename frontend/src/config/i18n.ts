import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar archivos de traducción
import esTranslation from '../locales/es/translation.json';
import enTranslation from '../locales/en/translation.json';

const resources = {
  es: {
    translation: esTranslation
  },
  en: {
    translation: enTranslation
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es', // Español como idioma por defecto
    debug: process.env.NODE_ENV === 'development',
    
    // Configuración del detector de idioma
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Configuración de interpolación
    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },

    // Configuración de react-i18next
    react: {
      useSuspense: false, // Evitar problemas con SSR
    },

    // Configuración de carga
    load: 'languageOnly',
    
    // Configuración de namespaces
    defaultNS: 'translation',
    ns: ['translation'],
  });

export default i18n; 