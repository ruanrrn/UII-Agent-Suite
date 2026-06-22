<script setup lang="ts">
import SiteHeader from '@/components/SiteHeader.vue';
import SiteFooter from '@/components/SiteFooter.vue';
import AppErrorBoundary from '@/components/AppErrorBoundary.vue';
import { useRoute, useRouter } from 'vue-router';
import { computed, nextTick, ref, watch } from 'vue';
const route = useRoute();
const router = useRouter();
const isConsole = computed(() => String(route.path).startsWith('/console'));
const isHome = computed(() => route.name === 'home');
// Pages that own the full viewport height and scroll internally (no outer scroll)
const isFill = computed(
  () => route.name === 'catalog' || route.name === 'capability' || isConsole.value
);
const appMain = ref<HTMLElement | null>(null);
const scrolled = ref(false);
const homePanel = ref<'home' | 'market'>('home');
const isRestoring = ref(false);
let scrollFrame: number | undefined;
let scrollTarget: HTMLElement | null = null;
const activeTab = computed<'home' | 'market'>(() => {
  if (isHome.value) return homePanel.value;
  if (route.name === 'catalog' || route.name === 'capability') return 'market';
  return 'home';
});
function onScroll(e: Event) {
  scrollTarget = e.target as HTMLElement;
  if (scrollFrame !== undefined) return;
  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = undefined;
    if (scrollTarget) updateScrollState(scrollTarget);
  });
}
function updateScrollState(target: HTMLElement) {
  scrolled.value = target.scrollTop > 12;
  if (isHome.value) {
    homePanel.value = target.scrollTop >= target.clientHeight * 0.5 ? 'market' : 'home';
  }
}
function snapHomeTo(panel: 'home' | 'market') {
  const target = appMain.value;
  if (!target) return;
  target.scrollTo({ top: panel === 'market' ? target.clientHeight : 0, behavior: 'smooth' });
  homePanel.value = panel;
}
function restoreHomeTo(panel: 'home' | 'market') {
  const target = appMain.value;
  if (!target) return;
  const top = panel === 'market' ? target.clientHeight : 0;
  isRestoring.value = true;
  // Disable snap + smooth scrolling imperatively so the jump lands
  // synchronously, before the browser paints — otherwise scroll-snap defers
  // the scroll and the black hero flashes on the way to the market panel.
  // (The .is-restoring class sets these too, but it lands on Vue's async
  // flush, which is too late for this synchronous scroll.)
  const prevSnap = target.style.scrollSnapType;
  const prevBehavior = target.style.scrollBehavior;
  target.style.scrollSnapType = 'none';
  target.style.scrollBehavior = 'auto';
  const apply = () => {
    target.scrollTop = top;
    homePanel.value = panel;
    scrolled.value = top > 12;
  };
  // `.home-market` is a fixed 100vh, so the scroll target exists at first
  // layout regardless of async catalog content. Apply now (pre-paint) and
  // re-assert once after layout settles, then release the lock.
  apply();
  requestAnimationFrame(apply);
  window.setTimeout(() => {
    target.style.scrollSnapType = prevSnap;
    target.style.scrollBehavior = prevBehavior;
    isRestoring.value = false;
  }, 200);
}
async function scrollHomeTo(panel: 'home' | 'market') {
  if (!isHome.value) {
    await router.push({ path: '/', query: panel === 'market' ? { screen: 'market' } : {} });
    await nextTick();
  }
  snapHomeTo(panel);
}
watch(
  [() => route.name, () => route.query.screen],
  async ([name, screen], [oldName, oldScreen]) => {
    if (name !== 'home') return;
    if (oldName === 'home' && screen === oldScreen) return;
    await nextTick();
    restoreHomeTo(screen === 'market' ? 'market' : 'home');
  },
  { immediate: true, flush: 'post' }
);
</script>
<template>
  <div class="app-shell">
    <SiteHeader
      :scrolled="scrolled"
      :home="isHome"
      :active-tab="activeTab"
      @select-tab="scrollHomeTo"
    />
    <div
      ref="appMain"
      class="app-main"
      :class="{ 'is-fill': isFill, 'is-home': isHome, 'is-restoring': isRestoring }"
      @scroll="onScroll"
    >
      <div class="app-content">
        <AppErrorBoundary>
          <RouterView />
        </AppErrorBoundary>
      </div>
      <SiteFooter v-if="!isConsole && !isFill && !isHome" />
    </div>
  </div>
</template>
