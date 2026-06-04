// assets/js/app-capability.js
(function () {
  const lang = UII.getLang();
  const id = new URLSearchParams(location.search).get('id');
  const cap = (window.CAPABILITIES || []).find(c => c.id === id);
  const root = document.getElementById('detail-root');
  if (!cap) { root.innerHTML = `<p class="empty">404 · ${id || ''}</p>`; return; }
  root.innerHTML = Components.detail(cap, lang);
  root.addEventListener('click', async e => {
    const b = e.target.closest('.mc-copy'); if (!b) return;
    await Components.copyText(b.dataset.md);
    b.textContent = t('copy.done', lang); setTimeout(() => b.textContent = t('detail.copyMd', lang), 1500);
  });
})();
