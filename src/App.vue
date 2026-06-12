<script setup lang="ts">
import SiteHeader from '@/components/SiteHeader.vue';
import SiteFooter from '@/components/SiteFooter.vue';
import AppErrorBoundary from '@/components/AppErrorBoundary.vue';
import { useRoute } from 'vue-router';
import { computed, ref } from 'vue';
const route = useRoute();
const isConsole = computed(() => String(route.path).startsWith('/console'));
// Pages that own the full viewport height and scroll internally (no outer scroll)
const isFill = computed(
  () => route.name === 'catalog' || route.name === 'capability' || isConsole.value
);
const scrolled = ref(false);
function onScroll(e: Event) {
  scrolled.value = (e.target as HTMLElement).scrollTop > 12;
}
</script>
<template>
  <div class="app-shell">
    <SiteHeader :scrolled="scrolled" />
    <div class="app-main" :class="{ 'is-fill': isFill }" @scroll="onScroll">
      <div class="app-content">
        <AppErrorBoundary>
          <RouterView />
        </AppErrorBoundary>
      </div>
      <SiteFooter v-if="!isConsole && !isFill" />
    </div>
  </div>
</template>
