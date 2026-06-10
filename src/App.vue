<script setup lang="ts">
import SiteHeader from '@/components/SiteHeader.vue';
import SiteFooter from '@/components/SiteFooter.vue';
import AppErrorBoundary from '@/components/AppErrorBoundary.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
const route = useRoute();
const isConsole = computed(() => String(route.path).startsWith('/console'));
</script>
<template>
  <SiteHeader />
  <AppErrorBoundary>
    <RouterView />
  </AppErrorBoundary>
  <SiteFooter v-if="!isConsole" />
</template>
