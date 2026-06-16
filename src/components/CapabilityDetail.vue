<script setup lang="ts">
import type { Capability } from '@/types/capability';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import McpConfigBlock from './McpConfigBlock.vue';

const props = defineProps<{ cap: Capability }>();
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

function goBack() {
  if (route.query.from === 'market') {
    router.push({ path: '/', query: { screen: 'market' } });
    return;
  }
  if (window.history.length > 1) router.back();
  else router.push('/catalog');
}

const L = () => locale.value as 'zh' | 'en';
const tx = (f: 'title' | 'overview') => props.cap.i18n[f][L()] || props.cap.i18n[f].zh;
type Tab = 'overview' | 'config';
const TABS: Tab[] = ['overview', 'config'];
const tab = ref<Tab>('overview');

const screenshotPath = computed(() => {
  const slug = props.cap.id
    .replace('uai-', '')
    .replace('-analysis', '')
    .replace('head-neck', 'headneck')
    .replace('lower-extremity', 'lowerext');
  return `${import.meta.env.BASE_URL}assets/${slug}-${L()}.png`;
});
const shotError = ref(false);
const lightboxOpen = ref(false);
const openLightbox = () => {
  if (!shotError.value) lightboxOpen.value = true;
};
const closeLightbox = () => {
  lightboxOpen.value = false;
};
const onShotError = () => {
  shotError.value = true;
};
const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeLightbox();
};
onMounted(() => window.addEventListener('keydown', handleEsc));
onUnmounted(() => window.removeEventListener('keydown', handleEsc));
</script>

<template>
  <div class="detail-page">
    <div class="detail-toolbar">
      <button class="detail-back" type="button" @click="goBack">{{ t('nav.back') }}</button>
    </div>

    <section class="detail-hero">
      <div class="detail-titleline">
        <img
          v-if="cap.icon.startsWith('/')"
          class="cap-icon-img big"
          :src="cap.icon"
          :alt="tx('title')"
        />
        <span v-else class="cap-icon big">{{ cap.icon }}</span>
        <h1>{{ tx('title') }}</h1>
      </div>
      <p v-if="tx('overview')" class="detail-summary">{{ tx('overview') }}</p>
    </section>

    <div class="tabbar detail-tabbar" role="tablist">
      <button
        v-for="k in TABS"
        :key="k"
        class="tab"
        :class="{ on: tab === k }"
        role="tab"
        :aria-selected="tab === k"
        type="button"
        @click="tab = k"
      >
        {{ t(`detail.tab.${k}`) }}
      </button>
    </div>

    <div class="detail-panels">
      <section v-if="tab === 'overview'">
        <div class="tab-lead">{{ t('detail.looksLike') }}</div>
        <figure v-if="!shotError" class="ov-shot-frame" @click="openLightbox">
          <img
            :src="screenshotPath"
            :alt="t('detail.screenshotAlt')"
            class="ov-shot-img"
            loading="lazy"
            @error="onShotError"
          />
          <figcaption class="ov-shot-hint">{{ t('detail.screenshotZoomHint') }}</figcaption>
        </figure>
        <div v-else class="ov-shot">{{ t('detail.shotPlaceholder') }}</div>

        <Teleport to="body">
          <div v-if="lightboxOpen" class="lightbox" @click="closeLightbox">
            <button class="lightbox-close" type="button" aria-label="Close" @click="closeLightbox">
              ×
            </button>
            <img
              :src="screenshotPath"
              :alt="t('detail.screenshotAlt')"
              class="lightbox-img"
              @click.stop
            />
          </div>
        </Teleport>
      </section>

      <section v-else>
        <McpConfigBlock :cap="cap" />
      </section>
    </div>
  </div>
</template>
