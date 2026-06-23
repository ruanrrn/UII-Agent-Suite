<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { publicAssetUrl } from '@/lib/assetUrl';
const { t } = useI18n();
</script>
<template>
  <footer id="site-footer">
    <div class="container foot-inner">
      <span>{{ t('foot.copy') }}</span>
      <a :href="publicAssetUrl('llms.txt')">llms.txt</a>
      <a :href="publicAssetUrl('catalog.json')">catalog.json</a>
    </div>
  </footer>
</template>
