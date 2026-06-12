<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ConsoleShell from '@/components/ConsoleShell.vue';
import StackedBarChart from '@/components/StackedBarChart.vue';
const { t } = useI18n();

const months = ['01', '02', '03', '04', '05', '06'];
const RATE = 0.05; // 预估单价：USD / 次调用

// 近 6 个月按能力的调用量（单位 k 次），含真实波动（3 月回落）
const caps = [
  { key: 'coronary', color: '#0066cc', values: [30, 35, 33, 39, 42, 44] },
  { key: 'headNeck', color: '#7c5cff', values: [22, 25, 23, 27, 28, 30] },
  { key: 'aorta', color: '#ff5316', values: [15, 18, 17, 20, 21, 23] },
  { key: 'pulmonary', color: '#0fd78a', values: [12, 14, 13, 16, 17, 18] },
  { key: 'lowerExt', color: '#c59d62', values: [9, 10, 10, 12, 13, 13] }
];

const QUOTA = 200; // 合约承诺额度（k 次/月）
const series = computed(() =>
  caps.map(c => ({ name: t(`usage.cap.${c.key}`), color: c.color, values: c.values }))
);
const totalCalls = computed(() => caps.reduce((s, c) => s + c.values[c.values.length - 1], 0));
const totalCost = computed(() => (totalCalls.value * RATE).toFixed(2));
const quotaPct = computed(() => Math.round((totalCalls.value / QUOTA) * 100));
const rows = computed(() =>
  caps.map(c => {
    const calls = c.values[c.values.length - 1];
    return {
      key: c.key,
      name: t(`usage.cap.${c.key}`),
      color: c.color,
      calls,
      share: ((calls / totalCalls.value) * 100).toFixed(1),
      cost: (calls * RATE).toFixed(2)
    };
  })
);
</script>
<template>
  <ConsoleShell active="usage">
    <h1>{{ t('console.usage') }}</h1>
    <div class="cn-cards">
      <div class="cn-stat">
        <div class="num">{{ totalCalls }}k</div>
        <div class="lbl">
          {{ t('console.calls') }} · <span class="cn-delta">+16% {{ t('usage.mom') }}</span>
        </div>
      </div>
      <div class="cn-stat">
        <div class="num">{{ quotaPct }}%</div>
        <div class="lbl">{{ t('usage.quota') }}</div>
        <div class="quota-bar">
          <span class="quota-fill" :style="{ width: quotaPct + '%' }"></span>
        </div>
        <div class="quota-sub">{{ totalCalls }}k / {{ QUOTA }}k {{ t('usage.unitCalls') }}</div>
      </div>
      <div class="cn-stat">
        <div class="num">{{ t('console.enterprise') }}</div>
        <div class="lbl">{{ t('console.plan') }} · {{ t('console.renews') }} 2027-01</div>
      </div>
    </div>

    <div class="cn-stat chart-panel">
      <div class="lbl">{{ t('usage.chartCallsCap') }}</div>
      <StackedBarChart :months="months" :series="series" />
    </div>

    <table class="cn-table usage-table">
      <thead>
        <tr>
          <th>{{ t('col.capability') }}</th>
          <th class="cn-num">{{ t('col.calls') }}</th>
          <th class="cn-num">{{ t('col.share') }}</th>
          <th class="cn-num">{{ t('col.cost') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.key">
          <td><span class="usage-dot" :style="{ background: r.color }"></span>{{ r.name }}</td>
          <td class="cn-num">{{ r.calls }}k</td>
          <td class="cn-num">{{ r.share }}%</td>
          <td class="cn-num">${{ r.cost }}k</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>{{ t('usage.total') }}</td>
          <td class="cn-num">{{ totalCalls }}k</td>
          <td class="cn-num">100%</td>
          <td class="cn-num">${{ totalCost }}k</td>
        </tr>
      </tfoot>
    </table>

    <p class="usage-note">{{ t('usage.note') }}</p>
  </ConsoleShell>
</template>
