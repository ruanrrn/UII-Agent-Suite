# Capability Detail Page: Screenshot Preview & Lightbox

**Date:** 2026-06-12  
**Scope:** Normalize screenshot filenames to ASCII slugs; add locale-matched preview display with lightbox zoom on detail page.

---

## Overview

The capability detail page currently shows a placeholder (`.ov-shot`) in the "What It Looks Like" section. This spec adds:
1. A locale-matched screenshot thumbnail (matching current language: zh → Chinese screenshot, en → English screenshot)
2. Click-to-zoom lightbox (fullscreen modal)
3. ESC/background-click to close

This is **not** a redesign of the description or naming metadata — only image preview + interaction.

---

## Scope & Constraints

**In scope:**
- Copy/normalize five capability screenshots from Chinese-named files to ASCII slug names
- Display locale-matched thumbnail in detail page's overview section
- Lightbox implementation (fullscreen zoom, close on ESC/background click)
- Update CapabilityDetail.vue to render screenshot + lightbox

**Out of scope (for later):**
- Adding official product names (uAI Discover codes) to title/metadata
- Vendor section or enriched descriptions
- Carousel of both languages (simple: one lang per lightbox view)
- Locales/console/catalog updates

---

## File Organization

**Source images** (existing):
- `public/assets/冠脉-中文.png` → `public/assets/coronary-zh.png`
- `public/assets/冠脉-英文.png` → `public/assets/coronary-en.png`
- `public/assets/主动脉-中文.png` → `public/assets/aorta-zh.png`
- `public/assets/主动脉-英文.png` → `public/assets/aorta-en.png`
- `public/assets/肺动脉-中文.png` → `public/assets/pulmonary-zh.png`
- `public/assets/肺动脉-英文.png` → `public/assets/pulmonary-en.png`
- `public/assets/头颈血管-中文.png` → `public/assets/headneck-zh.png`
- `public/assets/头颈血管-英文.png` → `public/assets/headneck-en.png`
- `public/assets/下肢血管-中文.png` → `public/assets/lowerext-zh.png`
- `public/assets/下肢血管-英文.png` → `public/assets/lowerext-en.png`

**Mapping convention (path derivation, no data change):**
```
/assets/{capabilityId}-{lang}.png
```
Example: `cap.id='uai-coronary-analysis'` → `/assets/uai-coronary-analysis-zh.png`

This is hardcoded in the detail component; no change to capabilities.ts schema needed.

---

## Component Design

### CapabilityDetail.vue Changes

**Current:**
```vue
<div class="ov-shot">{{ t('detail.shotPlaceholder') }}</div>
```

**Replaced with:**
```vue
<div class="ov-shot-container">
  <img 
    v-if="screenshotPath"
    :src="screenshotPath"
    :alt="t('detail.screenshotAlt')"
    class="ov-shot-thumb"
    @click="openLightbox"
  />
  <div v-else class="ov-shot">{{ t('detail.shotPlaceholder') }}</div>
</div>

<Teleport v-if="lightboxOpen" to="body">
  <div class="lightbox-overlay" @click="closeLightbox">
    <img :src="screenshotPath" :alt="t('detail.screenshotAlt')" class="lightbox-img" />
  </div>
</Teleport>
```

**Computed/reactive:**
```ts
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const lightboxOpen = ref(false);

// Path derivation (convention-based)
const screenshotPath = computed(() => {
  if (!cap.value) return null;
  // Remove 'uai-' prefix and derive: e.g., 'uai-coronary-analysis' → 'coronary-{lang}'
  const slug = cap.value.id.replace('uai-', '').replace('-analysis', '').replace('-', '');
  // Simplified: assumes standard naming. Adjust if needed.
  return `/assets/${slug}-${locale.value}.png`;
});

const openLightbox = () => { lightboxOpen.value = true; };
const closeLightbox = () => { lightboxOpen.value = false; };

// Close on ESC
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
  };
  window.addEventListener('keydown', handler);
  onUnmounted(() => window.removeEventListener('keydown', handler));
});
```

### CSS

**`.ov-shot-container`** — replaces `.ov-shot`:
```css
.ov-shot-container {
  position: relative;
  height: 200px; /* or auto, see below */
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  cursor: pointer;
}

.ov-shot-thumb {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
}

.ov-shot {
  /* fallback placeholder, unchanged */
  color: var(--ink-muted);
  font-size: 13px;
}
```

**`.lightbox-overlay`** — fullscreen modal:
```css
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
}

.lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
}
```

---

## Locale Switching Behavior

When user switches language (zh ↔ en) while detail page is open:
- `locale` reactive state updates → `screenshotPath` computed re-runs
- Thumbnail **and** any open lightbox image both update to new language
- No explicit close/reopen needed

---

## Image Naming & Slug Derivation

| Capability ID | Expected Slug | File Pattern |
|---|---|---|
| `uai-coronary-analysis` | `coronary` | `/assets/coronary-{lang}.png` |
| `uai-aorta-analysis` | `aorta` | `/assets/aorta-{lang}.png` |
| `uai-pulmonary-analysis` | `pulmonary` | `/assets/pulmonary-{lang}.png` |
| `uai-head-neck-analysis` | `headneck` | `/assets/headneck-{lang}.png` |
| `uai-lower-extremity-analysis` | `lowerext` | `/assets/lowerext-{lang}.png` |

**Slug extraction logic** (from ID):
```
slug = id.replace('uai-', '').replace('-analysis', '')
       .replace('head-neck', 'headneck')
       .replace('lower-extremity', 'lowerext')
```
Examples:
- `uai-coronary-analysis` → `coronary`
- `uai-aorta-analysis` → `aorta`
- `uai-pulmonary-analysis` → `pulmonary`
- `uai-head-neck-analysis` → `headneck`
- `uai-lower-extremity-analysis` → `lowerext`

---

## Testing

- [ ] All five screenshot pairs (zh/en) copied to `/assets/` with normalized names
- [ ] CapabilityDetail.vue renders thumbnail when screenshot exists, placeholder when missing
- [ ] Click thumbnail opens fullscreen lightbox
- [ ] ESC closes lightbox
- [ ] Background click closes lightbox
- [ ] Language toggle updates displayed image (both thumb and lightbox)
- [ ] No console errors on missing images

---

## Strings / i18n

Add to `src/locales/en.json` and `src/locales/zh.json`:
```json
"detail.screenshotAlt": "Product interface screenshot"
"detail.screenshotAlt": "产品界面截图"
```

(Already present: `detail.shotPlaceholder` for fallback.)

---

## Notes

- **No changes to `capabilities.ts` schema** — slug derivation is convention-based, hardcoded in component
- **Lightbox is simple (no carousel, no lang switcher inside)** — user can close and switch language in the top UI
- **Missing images gracefully fall back to placeholder** — if a file is not found, browser shows broken image; consider error handling if needed
- **Teleport pattern** — follows existing RowMenu.vue modal precedent

