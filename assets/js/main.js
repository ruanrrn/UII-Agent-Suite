// assets/js/main.js
(function () {
  const LANG_KEY = 'uii_lang';
  function getLang() {
    const u = new URLSearchParams(location.search).get('lang');
    if (u && window.LANGS.includes(u)) { localStorage.setItem(LANG_KEY, u); return u; }
    return localStorage.getItem(LANG_KEY) || 'zh';
  }
  function setLang(l) { localStorage.setItem(LANG_KEY, l); location.reload(); }
  window.UII = { getLang, setLang };

  const lang = getLang();
  document.documentElement.lang = (lang === 'zh' ? 'zh-CN' : 'en');
  const T = (k) => window.t(k, lang);
  const base = location.pathname.includes('/console/') ? '..' : '.';

  function header() {
    const other = lang === 'zh' ? 'en' : '中文';
    return `<div class="container nav-inner">
      <a class="brand" href="${base}/index.html"><span class="brand-mark">UII</span><span class="brand-text">联影智能 · Agent Hub</span></a>
      <nav class="nav-links">
        <a href="${base}/catalog.html">${T('nav.market')}</a>
        <a href="${base}/how-it-works.html">${T('nav.how')}</a>
        <a class="nav-cta" href="${base}/console/index.html">${T('nav.console')}</a>
        <button class="lang-toggle" type="button" aria-label="language">${other}</button>
      </nav></div>`;
  }
  function footer() {
    return `<div class="container foot-inner">
      <span>${T('foot.copy')}</span>
      <a href="${base}/llms.txt">llms.txt</a><a href="${base}/data/catalog.json">catalog.json</a>
      <a href="https://github.com/ruanrrn/uii-skills-hub" target="_blank" rel="noopener">GitHub</a>
    </div>`;
  }
  function mount() {
    const h = document.getElementById('site-header'); if (h) h.innerHTML = header();
    const f = document.getElementById('site-footer'); if (f) f.innerHTML = footer();
    const btn = document.querySelector('.lang-toggle');
    if (btn) btn.addEventListener('click', () => setLang(lang === 'zh' ? 'en' : 'zh'));
    const onScroll = () => h && h.classList.toggle('scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
