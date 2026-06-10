<script setup lang="ts">
import type { Capability } from '@/types/capability';
import { useI18n } from 'vue-i18n';
import Badge from './Badge.vue';
const props = defineProps<{ cap: Capability }>();
const { locale } = useI18n();
const L = () => locale.value as 'zh' | 'en';
const tx = (f: 'title' | 'tagline' | 'description') =>
  props.cap.i18n[f][L()] || props.cap.i18n[f].zh;
</script>
<template>
  <RouterLink class="cap-card" :to="`/capability/${cap.id}`">
    <div class="cap-top">
      <span class="cap-icon">{{ cap.icon }}</span>
      <span class="cap-badges"><Badge v-for="b in cap.badges" :key="b" :kind="b" /></span>
    </div>
    <h3 class="cap-name">{{ tx('title') }}</h3>
    <div class="cap-tagline">{{ tx('tagline') }}</div>
    <p class="cap-desc">{{ tx('description') }}</p>
    <div class="cap-foot">
      <span class="cap-modality">{{ cap.modality }}</span>
      <span v-if="cap.fda" class="cap-k">{{ cap.fda.kNumber }}</span>
    </div>
  </RouterLink>
</template>
