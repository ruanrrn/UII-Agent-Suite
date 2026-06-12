<script setup lang="ts">
import type { Capability } from '@/types/capability';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { fdaPdfUrl } from '@/lib/fda';
import Badge from './Badge.vue';
import McpSpecCard from './McpSpecCard.vue';
import McpConfigBlock from './McpConfigBlock.vue';
const props = defineProps<{ cap: Capability }>();
const router = useRouter();
const { t, locale } = useI18n();
function goBack() {
  if (window.history.length > 1) router.back();
  else router.push('/catalog');
}
const L = () => locale.value as 'zh' | 'en';
const tx = (f: 'title' | 'overview') => props.cap.i18n[f][L()] || props.cap.i18n[f].zh;
const bi = (b: { zh: string; en: string }) => b[L()] || b.zh;
type Tab = 'overview' | 'tools' | 'prompts' | 'resources' | 'config';
const TABS: Tab[] = ['overview', 'tools', 'prompts', 'resources', 'config'];
const tab = ref<Tab>('overview');

// Locale-matched product screenshot. Convention: /assets/{slug}-{lang}.png
// where slug is derived from the capability id (uai-<slug>-analysis).
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

const count = (k: Tab) =>
  k === 'tools'
    ? props.cap.mcp.tools.length
    : k === 'prompts'
      ? props.cap.mcp.prompts.length
      : k === 'resources'
        ? props.cap.mcp.resources.length
        : 0;
</script>
<template>
  <button class="detail-back" type="button" @click="goBack">← {{ t('nav.back') }}</button>
  <div class="detail-frame">
    <div class="detail-top">
      <div class="detail-id">
        <span class="cap-icon big">{{ cap.icon }}</span>
        <h1>{{ tx('title') }}</h1>
      </div>
      <RouterLink class="btn btn-key" to="/console">{{ t('detail.subscribe') }}</RouterLink>
    </div>

    <div class="tabbar" role="tablist">
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
        <span v-if="count(k)" class="tab-n">{{ count(k) }}</span>
      </button>
    </div>

    <div class="detail-panels">
      <section v-if="tab === 'overview'">
        <div class="tab-lead">{{ t('detail.whatItIs') }}</div>
        <p class="ov-text">{{ tx('overview') }}</p>
        <div class="tab-lead mt">{{ t('detail.looksLike') }}</div>
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

      <section v-else-if="tab === 'tools'">
        <div class="spec-grid">
          <McpSpecCard
            v-for="tool in cap.mcp.tools"
            :key="tool.name"
            :name="tool.name"
            :desc="bi(tool.desc)"
            :rows="[
              [t('detail.input'), tool.input],
              [t('detail.returns'), tool.returns]
            ]"
          />
        </div>
        <p class="tab-note">{{ t('detail.demoNote') }}</p>
      </section>

      <section v-else-if="tab === 'prompts'">
        <p v-if="!cap.mcp.prompts.length" class="empty">{{ t('detail.none') }}</p>
        <div v-else class="spec-grid">
          <McpSpecCard
            v-for="p in cap.mcp.prompts"
            :key="p.name"
            :name="p.name"
            :desc="bi(p.desc)"
            :rows="[[t('detail.args'), p.args]]"
          />
        </div>
        <p v-if="cap.mcp.prompts.length" class="tab-note">{{ t('detail.demoNote') }}</p>
      </section>

      <section v-else-if="tab === 'resources'">
        <p v-if="!cap.mcp.resources.length" class="empty">{{ t('detail.none') }}</p>
        <div v-else class="spec-grid">
          <McpSpecCard
            v-for="r in cap.mcp.resources"
            :key="r.uri"
            :name="r.uri"
            :desc="bi(r.desc)"
            :rows="[]"
          />
        </div>
      </section>

      <section v-else>
        <McpConfigBlock :cap="cap" />
      </section>
    </div>

    <div class="detail-foot">
      <a
        v-if="cap.fda"
        class="fda-pill amber"
        :href="fdaPdfUrl(cap.fda.kNumber)"
        target="_blank"
        rel="noopener"
        >FDA 510(k) · <span class="fda-k">{{ cap.fda.kNumber }}</span> ↗</a
      >
      <Badge v-else kind="demo" />
      <a
        v-if="cap.brochureUrl"
        class="foot-link"
        :href="cap.brochureUrl"
        target="_blank"
        rel="noopener"
        >{{ t('detail.brochure') }} ↗</a
      >
    </div>
  </div>
</template>
