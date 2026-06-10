<script setup lang="ts">
import { ref, inject, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { DataSource } from '@/services';
import type { Capability } from '@/types/capability';
import DualRail from '@/components/DualRail.vue';
const route = useRoute();
const { t } = useI18n();
const ds = inject<DataSource>('dataSource')!;
const cap = ref<Capability | null>(null);
const loaded = ref(false);
watchEffect(async onInvalidate => {
  let cancelled = false;
  onInvalidate(() => {
    cancelled = true;
  });
  loaded.value = false;
  const result = await ds.getCapability(String(route.params.id));
  if (!cancelled) {
    cap.value = result;
    loaded.value = true;
  }
});
</script>
<template>
  <main class="container detail-wrap">
    <DualRail v-if="cap" :cap="cap" />
    <p v-else-if="loaded" class="empty">{{ t('detail.notfound') }}</p>
  </main>
</template>
