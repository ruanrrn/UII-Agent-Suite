<script setup lang="ts">
import type { Capability } from '@/types/capability';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { fdaPdfUrl } from '@/lib/fda';
import Badge from './Badge.vue';
const props = defineProps<{ cap: Capability }>();
const router = useRouter();
const { t, locale } = useI18n();
const L = () => locale.value as 'zh' | 'en';
const tx = (f: 'title' | 'description') => props.cap.i18n[f][L()] || props.cap.i18n[f].zh;
const open = () => router.push(`/capability/${props.cap.id}`);
</script>
<template>
  <div class="cap-card" role="link" tabindex="0" @click="open" @keydown.enter="open">
    <div class="cap-top">
      <span class="cap-icon">{{ cap.icon }}</span>
      <span v-if="cap.series" class="cap-series">{{ cap.series }}</span>
    </div>
    <h3 class="cap-name">{{ tx('title') }}</h3>
    <div class="cap-use-label">{{ t('card.use') }}</div>
    <p class="cap-desc">{{ tx('description') }}</p>
    <div class="cap-foot">
      <a
        v-if="cap.fda"
        class="fda-pill"
        :href="fdaPdfUrl(cap.fda.kNumber)"
        target="_blank"
        rel="noopener"
        @click.stop
        >FDA 510(k) · <span class="fda-k">{{ cap.fda.kNumber }}</span> ↗</a
      >
      <Badge v-else kind="demo" />
    </div>
  </div>
</template>
