// assets/js/app-how.js
(function () {
  const lang = UII.getLang();
  document.getElementById('how-h').textContent = lang==='zh'?'如何工作：发现 → 开通 → 连接':'How it works: Discover → Activate → Connect';
  document.getElementById('how-lead').textContent = lang==='zh'
    ? '同一套能力，人用门户、智能体用 MCP；调用发生在医院私域内，数据不出院。'
    : 'Same capabilities — people via the portal, agents via MCP. Calls happen inside the hospital domain; data never leaves.';
  const steps = [
    [lang==='zh'?'① 人在门户发现并开通':'① A person discovers & activates', lang==='zh'?'院方 IT 在门户浏览能力、评估临床价值与 FDA 认证，完成开通。':'Hospital IT browses, evaluates clinical value & FDA clearance, and activates.'],
    [lang==='zh'?'② 获取连接配置':'② Get connection config', lang==='zh'?'开通后获得 MCP 端点与 API Key（详情页机器视图可复制）。':'After activation, get the MCP endpoint and API Key (copyable in the detail machine view).'],
    [lang==='zh'?'③ 智能体经 MCP 连接':'③ Agent connects via MCP', lang==='zh'?'院内 AI PACS（LLM+Agent）加载 Skill/MCP，按标准协议连接能力。':'In-house AI PACS (LLM+Agent) loads Skill/MCP and connects via the standard protocol.'],
    [lang==='zh'?'④ 私域内调用':'④ Runs inside your domain', lang==='zh'?'能力在医院私域内执行，数据不出院，过程可审计。':'Capabilities run inside the hospital domain; data stays in-house and is auditable.']
  ];
  document.getElementById('flow').innerHTML = steps.map(([h,p]) =>
    `<div class="flow-step"><h3>${Components.esc(h)}</h3><p>${Components.esc(p)}</p></div>`).join('');
})();
