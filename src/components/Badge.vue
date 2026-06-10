<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
const props = defineProps<{ kind: 'fda' | 'demo' | 'system' }>();
const { t } = useI18n();
const cls = computed(
  () => ({ fda: 'badge-fda', demo: 'badge-demo', system: 'badge-sys' })[props.kind] || ''
);
const label = computed(() =>
  props.kind === 'fda'
    ? t('badge.fda')
    : props.kind === 'demo'
      ? t('badge.demo')
      : t('badge.system')
);
</script>
<template>
  <span class="badge" :class="cls">{{ label }}</span>
</template>
