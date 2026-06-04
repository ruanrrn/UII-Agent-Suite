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
  function connectBlock(cap, lang) {
    const md = window.capabilityToMarkdown(cap, lang);
    const rows = [
      ['MCP endpoint', cap.connect.mcpEndpoint],
      ['API Key', cap.connect.apiKeyHint],
      ['llms.txt', cap.connect.llmsTxt]
    ].map(([k,v]) => `<div class="mc-row"><span class="mc-k">${k}</span><code>${esc(v)}</code></div>`).join('');
    return `<div class="machine-block">
      <div class="mc-title">${esc(window.t('detail.connect', lang))}</div>
      ${rows}
      <button class="mc-copy" data-md="${esc(md)}">${esc(window.t('detail.copyMd', lang))}</button>
    </div>`;
  }
  function detail(cap, lang) {
    const badges = (cap.badges||[]).map(b=>badge(b,lang)).join('');
    const fda = cap.fda ? `<div class="fda-line"><b>${esc(window.t('badge.fda',lang))}</b> · ${esc(cap.fda.kNumber)} · ${esc(cap.fda.decisionDate)} · ${esc(cap.fda.productCode)}<br><span class="fda-applicant">${esc(cap.fda.applicant)}</span></div>` : `<div class="fda-line">${esc(window.t('badge.demo',lang))}</div>`;
    return `<div class="detail-head"><span class="cap-icon big">${cap.icon}</span>
        <div><h1>${tx(cap,'title',lang)}</h1><div class="detail-tag">${tx(cap,'tagline',lang)}</div><div class="cap-badges">${badges}</div></div></div>
      <div class="detail-dual">
        <div class="dual-human"><div class="dual-label">${esc(window.t('detail.human',lang))}</div>
          <p>${tx(cap,'description',lang)}</p>
          <div class="dual-sub">${esc(window.t('detail.clinical',lang))}</div><p>${tx(cap,'clinicalUse',lang)}</p>
          ${fda}</div>
        <div class="dual-agent"><div class="dual-label dark">${esc(window.t('detail.agent',lang))}</div>
          ${connectBlock(cap, lang)}</div>
      </div>`;
  }
  function consoleShell(active, lang, base) {
    const nav = [
      ['index', 'console.dashboard'], ['services', 'console.services'],
      ['connect', 'console.connect'], ['usage', 'console.usage']
    ].map(([k,key]) => `<a class="cn-link${k===active?' on':''}" href="${base}/console/${k}.html">${esc(window.t(key,lang))}</a>`).join('');
    return `<aside class="cn-side"><div class="cn-brand">UII Console</div><nav>${nav}</nav></aside>`;
  }
  window.Components = { esc, tx, badge, card, grid, copyText, connectBlock, detail, consoleShell };
})();
