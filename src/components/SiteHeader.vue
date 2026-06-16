<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLang } from '@/i18n';
defineProps<{ scrolled?: boolean; home?: boolean; activeTab?: 'home' | 'market' }>();
defineEmits<{ 'select-tab': ['home' | 'market'] }>();
const { t, locale } = useI18n();
const logoSrc = computed(
  () => `${import.meta.env.BASE_URL}brand/uii-logo-${locale.value === 'zh' ? 'zh' : 'en'}.png`
);
const other = () => (locale.value === 'zh' ? 'en' : 'zh');
const currentLang = computed(() => (locale.value === 'zh' ? 'CN' : 'EN'));
function toggle() {
  setLang(locale.value === 'zh' ? 'en' : 'zh');
}
</script>
<template>
  <header id="site-header" :class="{ scrolled, home }">
    <div class="container nav-inner">
      <div class="nav-tools">
        <button
          class="lang-toggle"
          type="button"
          :aria-label="`Switch language to ${other().toUpperCase()}`"
          @click="toggle"
        >
          {{ currentLang }}
        </button>
      </div>
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
