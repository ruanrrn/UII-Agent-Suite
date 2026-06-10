<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { CAPABILITIES } from '@/data/capabilities';
const { t } = useI18n();
const ks = [...new Set(CAPABILITIES.filter(c => c.fda).map(c => c.fda!.kNumber))];
</script>
<template>
  <div class="trust-band">
    <span class="trust-chip">FDA 510(k)</span>
    <span v-for="k in ks" :key="k" class="trust-k">{{ k }}</span>
    <span class="trust-note">{{ t('trust.note') }}</span>
  </div>
</template>
