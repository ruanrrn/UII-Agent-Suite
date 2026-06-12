<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const base = import.meta.env.BASE_URL;
</script>
<template>
  <footer id="site-footer">
    <div class="container foot-inner">
      <span>{{ t('foot.copy') }}</span>
      <a :href="base + 'llms.txt'">llms.txt</a>
      <a :href="base + 'catalog.json'">catalog.json</a>
    </div>
  </footer>
</template>
