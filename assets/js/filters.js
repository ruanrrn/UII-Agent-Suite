// assets/js/filters.js
function filterCapabilities(caps, { q, type, modality } = {}) {
  const needle = (q || '').trim().toLowerCase();
  return caps.filter(c => {
    if (type && c.type !== type) return false;
    if (modality && c.modality !== modality) return false;
    if (needle) {
      const hay = [c.id, JSON.stringify(c.i18n), c.fda && c.fda.kNumber, c.modality]
        .filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}
if (typeof module !== 'undefined' && module.exports) module.exports = { filterCapabilities };
if (typeof window !== 'undefined') window.filterCapabilities = filterCapabilities;
