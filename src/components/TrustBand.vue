<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Capability } from '@/types/capability';
const props = defineProps<{ capabilities: Capability[] }>();
const { t } = useI18n();
const ks = computed(() => [
  ...new Set(props.capabilities.filter(c => c.fda).map(c => c.fda!.kNumber))
]);
</script>
<template>
  <div class="trust-band">
    <span class="trust-chip">FDA 510(k)</span>
    <span v-for="k in ks" :key="k" class="trust-k">{{ k }}</span>
    <span class="trust-note">{{ t('trust.note') }}</span>
  </div>
</template>
