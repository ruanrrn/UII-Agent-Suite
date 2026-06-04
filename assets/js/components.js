// assets/js/components.js
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tx = (cap, f, lang) => esc(cap.i18n[f][lang] || cap.i18n[f].zh);

  function badge(kind, lang) {
    if (kind === 'fda') return `<span class="badge badge-fda">${esc(window.t('badge.fda', lang))}</span>`;
    if (kind === 'demo') return `<span class="badge badge-demo">${esc(window.t('badge.demo', lang))}</span>`;
    if (kind === 'system') return `<span class="badge badge-sys">${lang==='zh'?'随系统获批':'within system'}</span>`;
    return '';
  }
  function card(cap, lang, base) {
    const badges = (cap.badges || []).map(b => badge(b, lang)).join('');
    const k = cap.fda ? `<span class="cap-k">${esc(cap.fda.kNumber)}</span>` : '';
    return `<a class="cap-card" href="${base}/capability.html?id=${esc(cap.id)}&lang=${lang}">
      <div class="cap-top"><span class="cap-icon">${cap.icon}</span><span class="cap-badges">${badges}</span></div>
      <h3 class="cap-name">${tx(cap,'title',lang)}</h3>
      <div class="cap-tagline">${tx(cap,'tagline',lang)}</div>
      <p class="cap-desc">${tx(cap,'description',lang)}</p>
      <div class="cap-foot"><span class="cap-modality">${esc(cap.modality)}</span>${k}</div>
    </a>`;
  }
  function grid(caps, lang, base) {
    if (!caps.length) return `<div class="empty">🔭 ${lang==='zh'?'没有匹配的能力':'No matching capabilities'}</div>`;
    return caps.map(c => card(c, lang, base)).join('');
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); return true; }
  }
  window.Components = { esc, tx, badge, card, grid, copyText };
})();
