<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CatalogView from '@/views/CatalogView.vue';

// Scroll restoration to the market panel is owned entirely by App.vue
// (restoreHomeTo), so there is no duplicate deferred scroll here that would
// otherwise re-introduce the hero flash on back-navigation.
const { t } = useI18n();
const baseUrl = import.meta.env.BASE_URL;
</script>

<template>
  <div class="home-page">
    <section class="hero home-snap" aria-labelledby="home-hero-title">
      <div class="hero-face-panel hero-face-panel-human" aria-hidden="true">
        <img class="hero-face hero-face-human" :src="`${baseUrl}brand/human-face.png`" alt="" />
      </div>
      <div class="hero-face-panel hero-face-panel-robot" aria-hidden="true">
        <img class="hero-face hero-face-robot" :src="`${baseUrl}brand/robot-face.png`" alt="" />
      </div>
      <div class="hero-copy">
        <p class="hero-kicker">{{ t('home.heroEyebrow') }}</p>
        <h1 id="home-hero-title" class="hero-title">{{ t('home.heroTitle') }}</h1>
        <p class="hero-lead">{{ t('home.heroSubtitle') }}</p>
      </div>
    </section>

    <section id="home-market" class="home-market home-snap" aria-label="市场">
      <CatalogView embedded />
    </section>
  </div>
</template>
