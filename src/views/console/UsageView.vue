<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import ConsoleShell from '@/components/ConsoleShell.vue';
const { t } = useI18n();
</script>
<template>
  <ConsoleShell active="usage">
    <h1>{{ t('console.usage') }}</h1>
    <div class="cn-cards">
      <div class="cn-stat"><div class="num">128k</div><div class="lbl">{{ t('console.calls') }}</div></div>
      <div class="cn-stat"><div class="num">{{ t('console.enterprise') }}</div><div class="lbl">{{ t('console.plan') }}</div></div>
      <div class="cn-stat"><div class="num">2027-01</div><div class="lbl">{{ t('console.renews') }}</div></div>
    </div>
    <p style="color: var(--ink-3)">{{ t('usage.note') }}</p>
  </ConsoleShell>
</template>
