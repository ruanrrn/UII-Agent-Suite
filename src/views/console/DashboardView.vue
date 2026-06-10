<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DataSource } from '@/services';
import type { ConsoleOverview } from '@/types/capability';
import ConsoleShell from '@/components/ConsoleShell.vue';
const { t, locale } = useI18n();
const ds = inject<DataSource>('dataSource')!;
const ov = ref<ConsoleOverview | null>(null);
onMounted(async () => {
  ov.value = await ds.getConsoleOverview();
});
const L = () => locale.value as 'zh' | 'en';
const services = computed(() => ov.value?.services ?? []);
</script>
<template>
  <ConsoleShell active="index">
    <h1>{{ t('console.dashboard') }}</h1>
    <div class="cn-cards">
      <div class="cn-stat">
        <div class="num">{{ ov?.activated ?? 0 }}</div>
        <div class="lbl">{{ t('console.activated') }}</div>
      </div>
      <div class="cn-stat">
        <div class="num">{{ ov?.callsThisMonth ?? '—' }}</div>
        <div class="lbl">{{ t('console.calls') }}</div>
      </div>
      <div class="cn-stat">
        <div class="num cn-online" style="font-size: 20px">{{ t('console.online') }}</div>
        <div class="lbl">{{ t('status.online') }}</div>
      </div>
    </div>
    <table class="cn-table">
      <thead>
        <tr>
          <th>{{ t('col.capability') }}</th>
          <th>{{ t('col.status') }}</th>
          <th>K#</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in services" :key="s.id">
          <td>{{ s.title[L()] }}</td>
          <td class="cn-online">{{ t('status.online') }}</td>
          <td>{{ s.kNumber }}</td>
        </tr>
      </tbody>
    </table>
  </ConsoleShell>
</template>
