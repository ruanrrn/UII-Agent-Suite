<script setup lang="ts">
import type { Capability } from '@/types/capability';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { fdaPdfUrl } from '@/lib/fda';
import Badge from './Badge.vue';
import McpSpecCard from './McpSpecCard.vue';
import McpConfigBlock from './McpConfigBlock.vue';
const props = defineProps<{ cap: Capability }>();
const { t, locale } = useI18n();
const L = () => locale.value as 'zh' | 'en';
const tx = (f: 'title' | 'overview') => props.cap.i18n[f][L()] || props.cap.i18n[f].zh;
const bi = (b: { zh: string; en: string }) => b[L()] || b.zh;
type Tab = 'overview' | 'tools' | 'prompts' | 'resources' | 'config';
const TABS: Tab[] = ['overview', 'tools', 'prompts', 'resources', 'config'];
const tab = ref<Tab>('overview');
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
        <div class="ov-shot">{{ t('detail.shotPlaceholder') }}</div>
      </section>

      <section v-else-if="tab === 'tools'">
        <div class="tab-lead">{{ t('detail.toolsLead') }}</div>
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
        <p class="tab-note">{{ t('detail.demoNote') }}</p>
      </section>

      <section v-else-if="tab === 'prompts'">
        <div class="tab-lead">{{ t('detail.promptsLead') }}</div>
        <p v-if="!cap.mcp.prompts.length" class="empty">{{ t('detail.none') }}</p>
        <McpSpecCard
          v-for="p in cap.mcp.prompts"
          :key="p.name"
          :name="p.name"
          :desc="bi(p.desc)"
          :rows="[[t('detail.args'), p.args]]"
        />
        <p v-if="cap.mcp.prompts.length" class="tab-note">{{ t('detail.demoNote') }}</p>
      </section>

      <section v-else-if="tab === 'resources'">
        <div class="tab-lead">{{ t('detail.resourcesLead') }}</div>
        <p v-if="!cap.mcp.resources.length" class="empty">{{ t('detail.none') }}</p>
        <McpSpecCard
          v-for="r in cap.mcp.resources"
          :key="r.uri"
          :name="r.uri"
          :desc="bi(r.desc)"
          :rows="[]"
        />
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
