import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enIssues from './locales/en/issues.json';
import enAgents from './locales/en/agents.json';
import enDashboard from './locales/en/dashboard.json';

import zhTWCommon from './locales/zh-TW/common.json';
import zhTWIssues from './locales/zh-TW/issues.json';
import zhTWAgents from './locales/zh-TW/agents.json';
import zhTWDashboard from './locales/zh-TW/dashboard.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        issues: enIssues,
        agents: enAgents,
        dashboard: enDashboard,
      },
      'zh-TW': {
        common: zhTWCommon,
        issues: zhTWIssues,
        agents: zhTWAgents,
        dashboard: zhTWDashboard,
      },
    },
    defaultNS: 'common',
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-TW'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'paperclip-language',
    },
  });

export default i18n;
