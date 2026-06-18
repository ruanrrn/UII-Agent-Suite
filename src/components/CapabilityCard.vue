<script setup lang="ts">
import type { Capability } from '@/types/capability';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ cap: Capability }>();
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const L = () => locale.value as 'zh' | 'en';
const tx = (f: 'title' | 'description') => props.cap.i18n[f][L()] || props.cap.i18n[f].zh;
const isImgIcon = (icon: string) => icon.startsWith('/');
const open = () =>
  router.push({
    path: `/capability/${props.cap.id}`,
    query: {
      ...(route.name === 'home' ? { from: 'market' } : {}),
      ...(route.query.category ? { category: route.query.category } : {})
    }
  });
</script>

<template>
  <div class="cap-card" role="link" tabindex="0" @click="open" @keydown.enter="open">
    <div class="cap-top">
      <img v-if="isImgIcon(cap.icon)" class="cap-icon-img" :src="cap.icon" :alt="tx('title')" />
      <span v-else class="cap-icon">{{ cap.icon }}</span>
      <h3 class="cap-name">{{ tx('title') }}</h3>
    </div>
    <div class="cap-use-label">{{ t('card.use') }}</div>
    <p class="cap-desc">{{ tx('description') }}</p>
  </div>
</template>
