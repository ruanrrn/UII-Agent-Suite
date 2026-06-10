<script setup lang="ts">
import type { Capability } from '@/types/capability';
import { useI18n } from 'vue-i18n';
import Badge from './Badge.vue';
import ConnectBlock from './ConnectBlock.vue';
const props = defineProps<{ cap: Capability }>();
const { t, locale } = useI18n();
const L = () => locale.value as 'zh' | 'en';
const tx = (f: 'title' | 'tagline' | 'description' | 'clinicalUse') =>
  props.cap.i18n[f][L()] || props.cap.i18n[f].zh;
</script>
<template>
  <div class="detail-head">
    <span class="cap-icon big">{{ cap.icon }}</span>
    <div>
      <h1>{{ tx('title') }}</h1>
      <div class="detail-tag">{{ tx('tagline') }}</div>
      <div class="cap-badges"><Badge v-for="b in cap.badges" :key="b" :kind="b" /></div>
    </div>
  </div>
  <div class="detail-dual">
    <div class="dual-human">
      <div class="dual-label">{{ t('detail.human') }}</div>
      <p>{{ tx('description') }}</p>
      <div class="dual-sub">{{ t('detail.clinical') }}</div>
      <p>{{ tx('clinicalUse') }}</p>
      <div v-if="cap.fda" class="fda-line">
        <b>{{ t('badge.fda') }}</b> · {{ cap.fda.kNumber }} · {{ cap.fda.decisionDate }} ·
        {{ cap.fda.productCode }}<br />
        <span class="fda-applicant">{{ cap.fda.applicant }}</span>
      </div>
      <div v-else class="fda-line">{{ t('badge.demo') }}</div>
    </div>
    <div class="dual-agent">
      <div class="dual-label dark">{{ t('detail.agent') }}</div>
      <ConnectBlock :cap="cap" />
    </div>
  </div>
</template>
