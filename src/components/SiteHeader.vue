<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLang } from '@/i18n';
defineProps<{ scrolled?: boolean }>();
const { t, locale } = useI18n();
const logoSrc = computed(
  () => `${import.meta.env.BASE_URL}brand/uii-logo-${locale.value === 'zh' ? 'zh' : 'en'}.png`
);
const other = () => (locale.value === 'zh' ? 'en' : 'zh');
function toggle() {
  setLang(locale.value === 'zh' ? 'en' : 'zh');
}
</script>
<template>
  <header id="site-header" :class="{ scrolled }">
    <div class="container nav-inner">
      <RouterLink class="brand" to="/">
        <img class="brand-logo" :src="logoSrc" :alt="t('brand.name')" />
        <span class="brand-suffix">{{ t('brand.suffix') }}</span>
      </RouterLink>
      <nav class="nav-links">
        <RouterLink class="nav-home" to="/">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/catalog">{{ t('nav.market') }}</RouterLink>
        <RouterLink to="/console">{{ t('nav.console') }}</RouterLink>
        <button class="lang-toggle" type="button" @click="toggle">{{ other() }}</button>
      </nav>
    </div>
  </header>
</template>
