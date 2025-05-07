import i18next from 'i18next';
   import { initReactI18next } from 'react-i18next';
   import LanguageDetector from 'i18next-browser-languagedetector';
   import en from './translations/en.json';
   import ru from './translations/ru.json';
   import kz from './translations/kz.json';

   i18next
     .use(LanguageDetector)
     .use(initReactI18next)
     .init({
       resources: {
         en: { translation: en },
         ru: { translation: ru },
         kz: { translation: kz },
       },
       fallbackLng: 'en',
       supportedLngs: ['en', 'ru', 'kz'],
       detection: {
         order: ['navigator', 'localStorage'],
         localStorageKey: 'i18nextLng',
       },
       interpolation: {
         escapeValue: false,
       },
     });

   export default i18next;