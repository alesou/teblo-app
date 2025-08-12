import 'react-i18next';
import esTranslation from '../locales/es/translation.json';

// Definir el tipo de las traducciones basado en el archivo español
type TranslationKeys = typeof esTranslation;

// Extender el módulo react-i18next
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationKeys;
    };
  }
}

// Exportar tipos útiles
export type TranslationKey = keyof TranslationKeys;
export type NestedTranslationKey<T> = T extends keyof TranslationKeys 
  ? TranslationKeys[T] extends object 
    ? keyof TranslationKeys[T] 
    : never 
  : never; 