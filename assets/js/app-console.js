// assets/js/app-console.js
(function () {
  const lang = UII.getLang(), T = k => t(k, lang);
  const page = document.body.getAttribute('data-console') || 'index';
  const root = document.getElementById('cn-root');
  const caps = window.CAPABILITIES.filter(c => c.fda).slice(0, 5); // 假装"已开通"
  const demo = `<span class="cn-demo">${T('console.demo')}</span>`;

  function dashboard() {
    return `<main class="cn-main">${demo}<h1>${T('console.dashboard')}</h1>
      <div class="cn-cards">
        <div class="cn-stat"><div class="num">${caps.length}</div><div class="lbl">${lang==='zh'?'已开通能力':'Activated'}</div></div>
        <div class="cn-stat"><div class="num">128k</div><div class="lbl">${lang==='zh'?'本月调用':'Calls this month'}</div></div>
        <div class="cn-stat"><div class="num cn-online" style="font-size:20px">${lang==='zh'?'在线':'Online'}</div><div class="lbl">${T('status.online')}</div></div>
      </div>
      <table class="cn-table"><thead><tr><th>${lang==='zh'?'能力':'Capability'}</th><th>${lang==='zh'?'状态':'Status'}</th><th>K#</th></tr></thead><tbody>
      ${caps.map(c=>`<tr><td>${c.i18n.title[lang]||c.i18n.title.zh}</td><td class="cn-online">${T('status.online')}</td><td>${c.fda.kNumber}</td></tr>`).join('')}
      </tbody></table></main>`;
  }
  function services() {
    return `<main class="cn-main">${demo}<h1>${T('console.services')}</h1>
      <table class="cn-table"><thead><tr><th>${lang==='zh'?'能力':'Capability'}</th><th>${lang==='zh'?'模态':'Modality'}</th><th>${lang==='zh'?'状态':'Status'}</th><th>${lang==='zh'?'到期':'Expires'}</th></tr></thead><tbody>
      ${caps.map((c,i)=>`<tr><td>${c.i18n.title[lang]||c.i18n.title.zh}</td><td>${c.modality}</td><td class="${i===caps.length-1?'cn-soon':'cn-online'}">${i===caps.length-1?(lang==='zh'?'即将到期':'Expiring'):T('status.online')}</td><td>2027-01-01</td></tr>`).join('')}
      </tbody></table></main>`;
  }
  function connect() {
    const blocks = caps.map(c => `<div style="margin-bottom:16px">${Components.connectBlock(c, lang)}</div>`).join('');
    return `<main class="cn-main">${demo}<h1>${T('console.connect')}</h1>
      <p style="color:var(--ink-3);max-width:46em">${lang==='zh'?'智能体经此连接：复制 MCP 端点与凭据到你的 AI PACS。':'Agents connect here: copy the MCP endpoint and credentials into your AI PACS.'}</p>
      <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">${blocks}</div></main>`;
  }
  function usage() {
    return `<main class="cn-main">${demo}<h1>${T('console.usage')}</h1>
      <div class="cn-cards">
        <div class="cn-stat"><div class="num">128k</div><div class="lbl">${lang==='zh'?'本月调用':'Calls'}</div></div>
        <div class="cn-stat"><div class="num">企业版</div><div class="lbl">${lang==='zh'?'当前订阅':'Plan'}</div></div>
        <div class="cn-stat"><div class="num">2027-01</div><div class="lbl">${lang==='zh'?'续费日':'Renews'}</div></div>
      </div>
      <p style="color:var(--ink-3)">${lang==='zh'?'（计量与账单为概念演示）':'(Metering & billing are conceptual demos)'}</p></main>`;
  }
  const pages = { index: dashboard, services, connect, usage };
  root.innerHTML = Components.consoleShell(page, lang, '..') + (pages[page] || dashboard)();
  root.addEventListener('click', async e => {
    const b = e.target.closest('.mc-copy'); if (!b) return;
    await Components.copyText(b.dataset.md); b.textContent = T('copy.done'); setTimeout(()=>b.textContent=T('detail.copyMd'),1500);
  });
})();
