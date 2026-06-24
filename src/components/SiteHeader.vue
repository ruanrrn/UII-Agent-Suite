<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { publicAssetUrl } from '@/lib/assetUrl';
defineProps<{ scrolled?: boolean; home?: boolean; activeTab?: 'home' | 'market' }>();
defineEmits<{ 'select-tab': ['home' | 'market'] }>();
const { t, locale } = useI18n();
const logoSrc = computed(() =>
  publicAssetUrl(`brand/uii-logo-${locale.value === 'zh' ? 'zh' : 'en'}.png`)
);
</script>
<template>
  <header id="site-header" :class="{ scrolled, home }">
    <div class="container nav-inner">
      <div class="nav-tools"></div>
      <nav class="nav-links">
        <button
          class="nav-tab"
          :class="{ on: activeTab === 'home' }"
          type="button"
          @click="$emit('select-tab', 'home')"
        >
          {{ t('nav.home') }}
        </button>
        <button
          class="nav-tab"
          :class="{ on: activeTab === 'market' }"
          type="button"
          @click="$emit('select-tab', 'market')"
        >
          {{ t('nav.market') }}
        </button>
      </nav>
      <RouterLink class="brand" to="/">
        <img class="brand-logo" :src="logoSrc" :alt="t('brand.name')" />
      </RouterLink>
    </div>
  </header>
</template>
