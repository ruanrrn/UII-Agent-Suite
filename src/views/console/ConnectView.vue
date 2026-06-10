<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DataSource } from '@/services';
import type { Capability } from '@/types/capability';
import ConsoleShell from '@/components/ConsoleShell.vue';
import ConnectBlock from '@/components/ConnectBlock.vue';
const { t } = useI18n();
const ds = inject<DataSource>('dataSource')!;
const caps = ref<Capability[]>([]);
onMounted(async () => {
  caps.value = (await ds.listCapabilities()).filter(c => c.fda).slice(0, 5);
});
</script>
<template>
  <ConsoleShell active="connect">
    <h1>{{ t('console.connect') }}</h1>
    <p style="color: var(--ink-3); max-width: 46em">{{ t('connect.lead') }}</p>
    <div
      style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))"
    >
      <div v-for="c in caps" :key="c.id"><ConnectBlock :cap="c" /></div>
    </div>
  </ConsoleShell>
</template>
