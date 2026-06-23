// src/i18n.ts
import { createI18n } from 'vue-i18n';
import zh from '@/locales/zh.json';
import en from '@/locales/en.json';

function detect(): 'zh' | 'en' {
  const u = new URLSearchParams(location.search).get('lang');
  return u === 'zh' ? 'zh' : 'en';
}
export const i18n = createI18n({
  legacy: false,
  locale: detect(),
  fallbackLocale: 'en',
  messages: { zh, en }
});
