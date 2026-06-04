// assets/js/app-capability.js
(function () {
  const lang = UII.getLang(), T = k => t(k, lang);
  const id = new URLSearchParams(location.search).get('id');
  const cap = (window.CAPABILITIES || []).find(c => c.id === id);
  const root = document.getElementById('detail-root');
  if (!cap) { root.innerHTML = `<p class="empty">404 · ${Components.esc(id || '')}</p>`; return; }
  root.innerHTML = Components.detail(cap, lang);
  root.addEventListener('click', async e => {
    const b = e.target.closest('.mc-copy'); if (!b) return;
    await Components.copyText(b.dataset.md);
    b.textContent = T('copy.done'); setTimeout(() => b.textContent = T('detail.copyMd'), 1500);
  });
})();
