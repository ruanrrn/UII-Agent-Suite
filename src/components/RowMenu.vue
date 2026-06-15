<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
export interface RowMenuItem {
  label: string;
  onSelect?: () => void;
  danger?: boolean;
}
defineProps<{ items: RowMenuItem[] }>();
const open = ref(false);
const placed = ref(false);
const btn = ref<HTMLButtonElement | null>(null);
const pop = ref<HTMLElement | null>(null);
const pos = ref({ top: 0, left: 0 });
const MENU_W = 168;
const GAP = 6;

async function toggle() {
  open.value = !open.value;
  if (open.value) {
    placed.value = false;
    await nextTick();
    const r = btn.value!.getBoundingClientRect();
    const popH = pop.value?.offsetHeight ?? 0;
    // flip above the button when there isn't room below
    const below = r.bottom + GAP;
    const top = below + popH > window.innerHeight - 8 ? r.top - GAP - popH : below;
    const left = Math.min(Math.max(8, r.right - MENU_W), window.innerWidth - MENU_W - 8);
    pos.value = { top: Math.round(top), left: Math.round(left) };
    placed.value = true;
  } else {
    placed.value = false;
  }
}
function pick(it: RowMenuItem) {
  open.value = false;
  it.onSelect?.();
}
function onDocClick(e: MouseEvent) {
  if (btn.value && !btn.value.contains(e.target as Node)) open.value = false;
}
function onDismiss() {
  open.value = false;
}
onMounted(() => {
  document.addEventListener('click', onDocClick);
  window.addEventListener('resize', onDismiss);
  // capture: close when any ancestor (e.g. the console main) scrolls
  window.addEventListener('scroll', onDismiss, true);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick);
  window.removeEventListener('resize', onDismiss);
  window.removeEventListener('scroll', onDismiss, true);
});
</script>
<template>
  <div class="rowmenu">
    <button
      ref="btn"
      class="rowmenu-btn"
      type="button"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click.stop="toggle"
    >
      ⋮
    </button>
    <Teleport to="body">
      <div
        v-if="open"
        ref="pop"
        class="rowmenu-pop"
        role="menu"
        :style="{
          top: pos.top + 'px',
          left: pos.left + 'px',
          width: MENU_W + 'px',
          visibility: placed ? 'visible' : 'hidden'
        }"
      >
        <button
          v-for="it in items"
          :key="it.label"
          class="rowmenu-item"
          :class="{ danger: it.danger }"
          type="button"
          role="menuitem"
          @click="pick(it)"
        >
          {{ it.label }}
        </button>
      </div>
    </Teleport>
  </div>
</template>
