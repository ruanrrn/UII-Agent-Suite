// src/i18n.ts
import { createI18n } from 'vue-i18n';
import zh from '@/locales/zh.json';
import en from '@/locales/en.json';

// hash 路由下 `?lang=zh` 既可能在 location.search，也可能在 hash 之后
// （如 #/capability/xxx?lang=zh），两处都要读。
function readLang(): string | null {
  const fromSearch = new URLSearchParams(location.search).get('lang');
  if (fromSearch) return fromSearch;
  const i = location.hash.indexOf('?');
  return i >= 0 ? new URLSearchParams(location.hash.slice(i + 1)).get('lang') : null;
}
function detect(): 'zh' | 'en' {
  return readLang() === 'zh' ? 'zh' : 'en';
}
export const i18n = createI18n({
  legacy: false,
  locale: detect(),
  fallbackLocale: 'en',
  messages: { zh, en }
});

// 当 URL 显式带 lang 时随之切换；不带 lang 的站内跳转保持当前语言。
window.addEventListener('hashchange', () => {
  const lang = readLang();
  if (lang === 'zh' || lang === 'en') i18n.global.locale.value = lang;
});
