<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLang } from '@/i18n';
const { t, locale } = useI18n();
const other = () => (locale.value === 'zh' ? 'en' : '中文');
function toggle() {
  setLang(locale.value === 'zh' ? 'en' : 'zh');
}
onMounted(() => {
  const h = document.getElementById('site-header');
  const f = () => h?.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', f, { passive: true });
  f();
});
</script>
<template>
  <header id="site-header">
    <div class="container nav-inner">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">UII</span><span class="brand-text">联影智能 · Agent Hub</span>
      </RouterLink>
      <nav class="nav-links">
        <RouterLink to="/catalog">{{ t('nav.market') }}</RouterLink>
        <RouterLink to="/how-it-works">{{ t('nav.how') }}</RouterLink>
        <RouterLink class="nav-cta" to="/console">{{ t('nav.console') }}</RouterLink>
        <button class="lang-toggle" type="button" @click="toggle">{{ other() }}</button>
      </nav>
    </div>
  </header>
</template>
