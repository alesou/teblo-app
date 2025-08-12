import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { t, changeLanguage, getCurrentLanguage, getAvailableLanguages } = useTranslation();
  
  const currentLanguage = getCurrentLanguage();
  const availableLanguages = getAvailableLanguages();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value;
    changeLanguage(newLanguage);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
        {t('settings.language')}:
      </label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {t(`settings.languages.${lang}`)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector; 