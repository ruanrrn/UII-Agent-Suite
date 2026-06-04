// assets/js/app-home.js
(function () {
  const lang = UII.getLang(), T = k => t(k, lang);
  const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  set('he', lang==='zh'?'人 + 智能体 · 双轨门户':'People + Agents · dual-rail portal');
  set('ht', T('hero.title')); set('hs', T('hero.sub'));
  set('c1', T('cta.browse')); document.getElementById('c1').href = 'catalog.html';
  set('c2', T('nav.console')); document.getElementById('c2').href = 'console/index.html';

  set('what-title', T('section.what'));
  const what = [
    [lang==='zh'?'双受众':'Two audiences', lang==='zh'?'你的人用 Web，你的 AI PACS 用 MCP，同一套能力。':'Your people use the web; your AI PACS uses MCP — same capabilities.'],
    [lang==='zh'?'私域安全':'Private & secure', lang==='zh'?'AI 能力与数据在院内私域运行，数据不出院。':'AI and data run inside the hospital — data never leaves.'],
    [lang==='zh'?'MCP 标准输出':'MCP standard', lang==='zh'?'能力按 MCP 标准协议输出给智能体。':'Capabilities exposed to agents via the MCP standard.'],
    [lang==='zh'?'真实认证':'Real clearances', lang==='zh'?'目录全部为可查 FDA 510(k) 的真实 AI 软件。':'Catalog is real FDA 510(k)-cleared AI software.']
  ];
  document.getElementById('what-grid').innerHTML = what.map(([h,p]) =>
    `<div class="what-card"><div class="what-dot"></div><h3>${Components.esc(h)}</h3><p>${Components.esc(p)}</p></div>`).join('');

  set('feat-title', T('section.featured'));
  set('feat-all', lang==='zh'?'查看全部 →':'View all →');
  const featured = window.CAPABILITIES.filter(c => c.type !== 'skill').slice(0, 6);
  document.getElementById('home-grid').innerHTML = Components.grid(featured, lang, '.');

  set('how-title', T('nav.how'));
  const steps = [
    ['1', lang==='zh'?'发现':'Discover', lang==='zh'?'在门户浏览并评估能力':'Browse & evaluate in the portal'],
    ['2', lang==='zh'?'开通':'Activate', lang==='zh'?'拿到凭据与连接配置':'Get credentials & connection config'],
    ['3', lang==='zh'?'连接':'Connect', lang==='zh'?'AI PACS 经 MCP 在私域内调用':'AI PACS calls via MCP, inside your domain']
  ];
  document.getElementById('how-steps').innerHTML = steps.map(([n,h,p]) =>
    `<div class="step"><span class="step-n">${n}</span><h3>${Components.esc(h)}</h3><p>${Components.esc(p)}</p></div>`).join('')
    + `<a class="btn btn-key" href="how-it-works.html">${T('nav.how')} →</a>`;

  set('trust-title', T('section.trust'));
  const ks = [...new Set(window.CAPABILITIES.filter(c=>c.fda).map(c=>c.fda.kNumber))];
  document.getElementById('trust-band').innerHTML =
    `<span class="trust-chip">FDA 510(k)</span>` +
    ks.map(k=>`<span class="trust-k">${k}</span>`).join('') +
    `<span class="trust-note">${lang==='zh'?'数据不出院 · 院内隔离 · 审计':'Data stays in-house · isolation · audit'}</span>`;
})();
