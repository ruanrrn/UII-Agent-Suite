// src/i18n.ts
import { createI18n } from 'vue-i18n';
import zh from '@/locales/zh.json';
import en from '@/locales/en.json';

const KEY = 'uii_lang';
function detect(): 'zh' | 'en' {
  const u = new URLSearchParams(location.search).get('lang');
  if (u === 'zh' || u === 'en') {
    localStorage.setItem(KEY, u);
    return u;
  }
  const s = localStorage.getItem(KEY);
  return s === 'en' ? 'en' : 'zh';
}
export const i18n = createI18n({
  legacy: false,
  locale: detect(),
  fallbackLocale: 'zh',
  messages: { zh, en }
});
export function setLang(l: 'zh' | 'en') {
  localStorage.setItem(KEY, l);
  location.reload();
}
