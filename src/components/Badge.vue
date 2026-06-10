<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const props = defineProps<{ kind: string }>();
const { t } = useI18n();
const cls = { fda: 'badge-fda', demo: 'badge-demo', system: 'badge-sys' }[props.kind] || '';
const label = () =>
  props.kind === 'fda'
    ? t('badge.fda')
    : props.kind === 'demo'
      ? t('badge.demo')
      : t('badge.system');
</script>
<template>
  <span class="badge" :class="cls">{{ label() }}</span>
</template>
