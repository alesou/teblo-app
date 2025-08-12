import { useTranslation as useI18nTranslation } from 'react-i18next';
import '../types/i18n';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    // Guardar en localStorage para persistencia
    localStorage.setItem('i18nextLng', language);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const getAvailableLanguages = () => {
    return Object.keys(i18n.options.resources || {});
  };

  return {
    t,
    i18n,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
  };
}; 