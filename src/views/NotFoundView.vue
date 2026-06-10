<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
<template>
  <main class="container" style="padding: 60px 32px">
    <p class="empty">404 · {{ t('detail.notfound') }}</p>
  </main>
</template>
