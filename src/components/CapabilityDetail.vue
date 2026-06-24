<script setup lang="ts">
import type { Capability } from '@/types/capability';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { fdaPdfUrl } from '@/lib/fda';
import { publicAssetUrl } from '@/lib/assetUrl';

const props = defineProps<{ cap: Capability }>();
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

function goBack() {
  if (route.query.from === 'market') {
    router.push({
      path: '/',
      query: {
        screen: 'market',
        ...(route.query.category ? { category: route.query.category } : {})
      }
    });
    return;
  }
  if (window.history.length > 1) router.back();
  else {
    router.push({
      path: '/catalog',
      query: route.query.category ? { category: route.query.category } : undefined
    });
  }
}

const L = () => locale.value as 'zh' | 'en';
const bi = (b: string | { zh: string; en: string }) => (typeof b === 'string' ? b : b[L()] || b.zh);

type Tab = 'overview' | 'install';
const TABS: Tab[] = ['overview', 'install'];
const tab = ref<Tab>('overview');

const d = props.cap.detail;

const copyLabel = ref('');
async function copyQS() {
  if (!d?.quickStart) return;
  try {
    await navigator.clipboard.writeText(bi(d.quickStart.code));
    copyLabel.value = t('copy.done');
    setTimeout(() => (copyLabel.value = ''), 2000);
  } catch {
    /* ignore */
  }
}
</script>

<template>
  <div class="detail-page">
    <!-- Hero: icon + name + FDA badge, with the back button right-aligned on the same row -->
    <section class="detail-hero">
      <div class="sk-product-row">
        <div class="sk-product-icon">
          <img
            v-if="cap.icon.startsWith('/')"
            :src="publicAssetUrl(cap.icon)"
            :alt="bi(cap.i18n.title)"
            class="sk-product-icon-img"
          />
        </div>
        <div>
          <h1 class="sk-product-name">{{ bi(cap.i18n.title) }}</h1>
          <a
            v-if="cap.fda"
            class="sk-badge-fda"
            :href="fdaPdfUrl(cap.fda.kNumber)"
            target="_blank"
            rel="noopener"
            @click.stop
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path
                d="M5.5 1L6.8 4.1H10L7.6 6L8.5 9.2L5.5 7.4L2.5 9.2L3.4 6L1 4.1H4.2L5.5 1Z"
                fill="currentColor"
              />
            </svg>
            FDA 510(k) {{ cap.fda.kNumber }}
          </a>
        </div>
        <button class="detail-back sk-back" type="button" @click="goBack">
          {{ t('nav.back') }}
        </button>
      </div>
    </section>

    <!-- Tabs -->
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

    <!-- Panels -->
    <div class="detail-panels">
      <!-- ═══ OVERVIEW ═══ -->
      <section v-if="tab === 'overview' && d">
        <!-- Intro -->
        <div class="sk-intro">{{ bi(d.intro) }}</div>

        <!-- Stats -->
        <div v-if="d.stats.length" class="sk-stats-grid">
          <div v-for="(s, i) in d.stats" :key="i" class="sk-stat">
            <button v-if="bi(s.sub)" class="sk-stat-help" type="button" :aria-label="bi(s.sub)">
              ?
              <span class="sk-stat-tip">{{ bi(s.sub) }}</span>
            </button>
            <div class="sk-stat-label">{{ bi(s.label) }}</div>
            <div class="sk-stat-value">{{ bi(s.value) }}</div>
          </div>
        </div>

        <!-- Capabilities -->
        <div v-if="d.capabilities.length">
          <div class="sk-section-label">{{ t('detail.section.capabilities') }}</div>
          <div class="sk-checklist">
            <div v-for="(c, i) in d.capabilities" :key="i" class="sk-check-row">
              <span class="sk-check-icon">✓</span>
              <span>{{ bi(c) }}</span>
            </div>
          </div>
        </div>

        <div v-if="d.workflow.length" class="sk-divider"></div>

        <!-- Workflow -->
        <div v-if="d.workflow.length">
          <div class="sk-section-label">{{ t('detail.section.workflow') }}</div>
          <div class="sk-workflow">
            <ul class="sk-wf-list">
              <li
                v-for="(step, i) in d.workflow"
                :key="i"
                class="sk-wf-item"
                :class="{ 'sk-wf-item--last': i === d.workflow.length - 1 }"
              >
                <div
                  class="sk-wf-node"
                  :class="{
                    'sk-wf-node--default': step.nodeType === 'default',
                    'sk-wf-node--warn': step.nodeType === 'warn',
                    'sk-wf-node--mcp': step.nodeType === 'mcp',
                    'sk-wf-node--end': step.nodeType === 'end'
                  }"
                >
                  {{ step.nodeLabel }}
                </div>
                <div class="sk-wf-content">
                  <div class="sk-wf-title">
                    {{ bi(step.title) }}
                    <span
                      v-for="(tag, ti) in step.tags || []"
                      :key="ti"
                      class="sk-tag"
                      :class="{
                        'sk-tag--warn': tag.type === 'warn',
                        'sk-tag--mcp': tag.type === 'mcp'
                      }"
                    >
                      {{ tag.text }}
                    </span>
                  </div>
                  <div class="sk-wf-desc">{{ bi(step.desc) }}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Fallback overview for skills without detail -->
      <section v-else-if="tab === 'overview' && !d">
        <p class="ov-text">{{ bi(cap.i18n.description) || bi(cap.i18n.overview) }}</p>
      </section>

      <!-- ═══ INSTALL ═══ -->
      <section v-if="tab === 'install' && d">
        <!-- Prerequisites -->
        <div v-if="d.prerequisites.length">
          <div class="sk-section-label" style="margin-top: 4px">
            {{ t('detail.section.prerequisites') }}
          </div>
          <div class="sk-reqs">
            <div v-for="(req, i) in d.prerequisites" :key="i" class="sk-req">
              <div
                class="sk-req-icon"
                :class="{
                  'sk-ri-mcp': req.iconType === 'mcp',
                  'sk-ri-pacs': req.iconType === 'pacs',
                  'sk-ri-comply': req.iconType === 'compliance'
                }"
              >
                <!-- MCP icon -->
                <svg
                  v-if="req.iconType === 'mcp'"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <rect
                    x="3"
                    y="5"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="#1a6b35"
                    stroke-width="1.5"
                  />
                  <path
                    d="M7 10H13M10 7V13"
                    stroke="#1a6b35"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                <!-- PACS icon -->
                <svg
                  v-else-if="req.iconType === 'pacs'"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <rect
                    x="3"
                    y="3"
                    width="14"
                    height="14"
                    rx="2"
                    stroke="#0c3f6e"
                    stroke-width="1.5"
                  />
                  <circle cx="10" cy="10" r="3" stroke="#0c3f6e" stroke-width="1.5" />
                  <line
                    x1="3"
                    y1="10"
                    x2="7"
                    y2="10"
                    stroke="#0c3f6e"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                  <line
                    x1="13"
                    y1="10"
                    x2="17"
                    y2="10"
                    stroke="#0c3f6e"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                <!-- Compliance icon -->
                <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 2L4 5V10C4 13.5 6.5 16.7 10 18C13.5 16.7 16 13.5 16 10V5L10 2Z"
                    stroke="#c0392b"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M7.5 10L9.5 12L13 8"
                    stroke="#c0392b"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div class="sk-req-name">{{ bi(req.name) }}</div>
                <div class="sk-req-desc">{{ bi(req.desc) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Triggers -->
        <div v-if="d.triggers.phrases.length || bi(d.triggers.note)">
          <div class="sk-section-label">{{ t('detail.section.triggers') }}</div>
          <div class="sk-trigger">
            <div v-if="d.triggers.phrases.length" class="sk-trigger-pills">
              <span v-for="(p, i) in d.triggers.phrases" :key="i" class="sk-trigger-pill">
                {{ p }}
              </span>
            </div>
            <p v-if="bi(d.triggers.note)" class="sk-trigger-desc">{{ bi(d.triggers.note) }}</p>
          </div>
        </div>

        <!-- Quick Start -->
        <div v-if="d.quickStart">
          <div class="sk-section-label">{{ t('detail.section.quickstart') }}</div>
          <div class="sk-qs">
            <div class="sk-qs-body">
              <div class="sk-qs-hint">{{ bi(d.quickStart.hint) }}</div>
              <div class="sk-qs-code-wrap">
                <pre class="sk-qs-code">{{ bi(d.quickStart.code) }}</pre>
                <button class="sk-qs-copy" @click="copyQS">
                  <svg v-if="!copyLabel" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect
                      x="4"
                      y="4"
                      width="7"
                      height="7"
                      rx="1"
                      stroke="currentColor"
                      stroke-width="1.2"
                    />
                    <path
                      d="M1 8V2C1 1.45 1.45 1 2 1H8"
                      stroke="currentColor"
                      stroke-width="1.2"
                      stroke-linecap="round"
                    />
                  </svg>
                  {{ copyLabel || t('copy.label') }}
                </button>
              </div>
            </div>
            <div class="sk-qs-footer">
              <a
                v-for="(link, i) in d.quickStart.links"
                :key="i"
                :href="link.href"
                class="sk-qs-foot-btn"
                target="_blank"
                rel="noopener"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M2 2H8L11 5V11H2V2Z"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8 2V5H11"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linejoin="round"
                  />
                </svg>
                {{ bi(link.label) }}
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Fallback install for skills without detail -->
      <section v-else-if="tab === 'install' && !d">
        <p class="ov-text">{{ t('detail.none') }}</p>
      </section>
    </div>
  </div>
</template>
