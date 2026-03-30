import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enIssues from './locales/en/issues.json';
import enAgents from './locales/en/agents.json';
import enDashboard from './locales/en/dashboard.json';
import enProjects from './locales/en/projects.json';
import enGoals from './locales/en/goals.json';
import enRoutines from './locales/en/routines.json';
import enApprovals from './locales/en/approvals.json';
import enInbox from './locales/en/inbox.json';
import enCompanies from './locales/en/companies.json';
import enActivity from './locales/en/activity.json';
import enCosts from './locales/en/costs.json';
import enAuth from './locales/en/auth.json';
import enSettings from './locales/en/settings.json';
import enPlugins from './locales/en/plugins.json';

import zhTWCommon from './locales/zh-TW/common.json';
import zhTWIssues from './locales/zh-TW/issues.json';
import zhTWAgents from './locales/zh-TW/agents.json';
import zhTWDashboard from './locales/zh-TW/dashboard.json';
import zhTWProjects from './locales/zh-TW/projects.json';
import zhTWGoals from './locales/zh-TW/goals.json';
import zhTWRoutines from './locales/zh-TW/routines.json';
import zhTWApprovals from './locales/zh-TW/approvals.json';
import zhTWInbox from './locales/zh-TW/inbox.json';
import zhTWCompanies from './locales/zh-TW/companies.json';
import zhTWActivity from './locales/zh-TW/activity.json';
import zhTWCosts from './locales/zh-TW/costs.json';
import zhTWAuth from './locales/zh-TW/auth.json';
import zhTWSettings from './locales/zh-TW/settings.json';
import zhTWPlugins from './locales/zh-TW/plugins.json';

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
        projects: enProjects,
        goals: enGoals,
        routines: enRoutines,
        approvals: enApprovals,
        inbox: enInbox,
        companies: enCompanies,
        activity: enActivity,
        costs: enCosts,
        auth: enAuth,
        settings: enSettings,
        plugins: enPlugins,
      },
      'zh-TW': {
        common: zhTWCommon,
        issues: zhTWIssues,
        agents: zhTWAgents,
        dashboard: zhTWDashboard,
        projects: zhTWProjects,
        goals: zhTWGoals,
        routines: zhTWRoutines,
        approvals: zhTWApprovals,
        inbox: zhTWInbox,
        companies: zhTWCompanies,
        activity: zhTWActivity,
        costs: zhTWCosts,
        auth: zhTWAuth,
        settings: zhTWSettings,
        plugins: zhTWPlugins,
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
