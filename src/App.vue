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
let snapTimer: number | undefined;
const isSnapping = ref(false);
const isRestoring = ref(false);
const activeTab = computed<'home' | 'market'>(() => {
  if (isHome.value) return homePanel.value;
  if (route.name === 'catalog' || route.name === 'capability') return 'market';
  return 'home';
});
function onScroll(e: Event) {
  const target = e.target as HTMLElement;
  scrolled.value = target.scrollTop > 12;
  if (isHome.value) {
    homePanel.value = target.scrollTop >= target.clientHeight * 0.5 ? 'market' : 'home';
    if (!isSnapping.value) {
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => {
        const top = target.scrollTop;
        const height = target.clientHeight;
        if (top > height * 0.24 && top < height * 0.92) snapHomeTo('market');
        else if (top > height * 0.04 && top <= height * 0.24) snapHomeTo('home');
      }, 140);
    }
  }
}
function snapHomeTo(panel: 'home' | 'market') {
  const target = appMain.value;
  if (!target) return;
  isSnapping.value = true;
  target.scrollTo({ top: panel === 'market' ? target.clientHeight : 0, behavior: 'smooth' });
  homePanel.value = panel;
  window.setTimeout(() => {
    isSnapping.value = false;
  }, 620);
}
function restoreHomeTo(panel: 'home' | 'market') {
  const restore = () => {
    const target = appMain.value;
    if (!target) return;
    const top = panel === 'market' ? target.clientHeight : 0;
    isRestoring.value = true;
    target.scrollTo({ top, behavior: 'auto' });
    homePanel.value = panel;
    scrolled.value = top > 12;
    window.setTimeout(() => {
      isRestoring.value = false;
    }, 420);
  };
  requestAnimationFrame(() => requestAnimationFrame(restore));
  window.setTimeout(restore, 120);
  window.setTimeout(restore, 320);
}
async function scrollHomeTo(panel: 'home' | 'market') {
  if (!isHome.value) {
    await router.push({ path: '/', query: panel === 'market' ? { screen: 'market' } : {} });
    await nextTick();
  }
  snapHomeTo(panel);
}
watch(
  () => route.fullPath,
  async () => {
    if (route.name !== 'home') return;
    await nextTick();
    restoreHomeTo(route.query.screen === 'market' ? 'market' : 'home');
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
