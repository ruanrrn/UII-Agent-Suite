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
  <ConsoleShell active="services">
    <h1>{{ t('console.services') }}</h1>
    <table class="cn-table">
      <thead>
        <tr>
          <th>{{ t('col.capability') }}</th>
          <th>{{ t('col.modality') }}</th>
          <th>{{ t('col.status') }}</th>
          <th>{{ t('col.expires') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in services" :key="s.id">
          <td>{{ s.title[L()] }}</td>
          <td>{{ s.modality }}</td>
          <td :class="s.status === 'expiring' ? 'cn-soon' : 'cn-online'">
            {{ s.status === 'expiring' ? t('console.expiring') : t('status.online') }}
          </td>
          <td>2027-01-01</td>
        </tr>
      </tbody>
    </table>
  </ConsoleShell>
</template>
