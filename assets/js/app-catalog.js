// assets/js/app-catalog.js
(function () {
  const lang = UII.getLang(), T = k => t(k, lang);
  const TYPES = [['', lang==='zh'?'全部':'All'], ['clinical-ai', lang==='zh'?'临床 AI 辅助':'Clinical AI'],
    ['platform', lang==='zh'?'AI 影像平台':'AI platform'], ['reconstruction', lang==='zh'?'AI 重建增强':'Reconstruction'],
    ['skill', 'Skill']];
  const MODS = ['', 'CT', 'MR', 'PET', 'X-ray', 'Cross'];
  const state = { q: '', type: '', modality: '' };

  document.getElementById('cat-title').textContent = T('catalog.title');
  document.getElementById('cat-search').placeholder = T('catalog.search');

  function side() {
    const tBtns = TYPES.map(([v,l]) => `<button class="side-item${v===state.type?' on':''}" data-type="${v}">${l}</button>`).join('');
    const mBtns = MODS.map(m => `<button class="side-chip${m===state.modality?' on':''}" data-mod="${m}">${m||(lang==='zh'?'全部':'All')}</button>`).join('');
    return `<div class="side-label">${T('filter.type')}</div><div class="side-list">${tBtns}</div>
      <div class="side-label">${T('filter.modality')}</div><div class="side-chips">${mBtns}</div>`;
  }
  function render() {
    const res = filterCapabilities(window.CAPABILITIES, state);
    document.getElementById('cat-count').textContent = `${res.length} ${T('catalog.count')}`;
    document.getElementById('cat-grid').innerHTML = Components.grid(res, lang, '.');
  }
  function bind() {
    document.getElementById('cat-side').innerHTML = side();
    document.getElementById('cat-side').addEventListener('click', e => {
      const tb = e.target.closest('[data-type]'); const mb = e.target.closest('[data-mod]');
      if (tb) state.type = tb.dataset.type; if (mb) state.modality = mb.dataset.mod;
      bind(); render();
    });
    document.getElementById('cat-search').addEventListener('input', e => { state.q = e.target.value; render(); });
  }
  bind(); render();
})();
