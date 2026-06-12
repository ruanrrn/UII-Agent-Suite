<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const steps = ['s1', 's2', 's3', 's4'] as const;
const highlights = ['audience', 'private', 'mcp', 'real'] as const;
</script>
<template>
  <main>
    <section class="section how-hero">
      <div class="container">
        <h1>{{ t('how.title') }}</h1>
        <p class="how-lead">{{ t('how.lead') }}</p>
      </div>
    </section>

    <section class="section" style="background: var(--bg-section)">
      <div class="container">
        <div class="how-steps">
          <div v-for="(s, i) in steps" :key="s" class="how-step">
            <div class="how-step-left">
              <div class="how-step-num">{{ i + 1 }}</div>
              <div v-if="i < steps.length - 1" class="how-step-line" />
            </div>
            <div class="how-step-body">
              <h3>{{ t(`how.${s}.title`) }}</h3>
              <p>{{ t(`how.${s}.desc`) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2>{{ t('section.what') }}</h2>
        <div class="what-grid">
          <div v-for="w in highlights" :key="w" class="what-card">
            <div class="what-dot"></div>
            <h3>{{ t(`what.${w}.title`) }}</h3>
            <p>{{ t(`what.${w}.desc`) }}</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
