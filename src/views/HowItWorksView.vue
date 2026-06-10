<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const steps = ['s1', 's2', 's3', 's4'] as const;
</script>
<template>
  <main>
    <section class="section dark">
      <div class="container">
        <h1>{{ t('how.title') }}</h1>
        <p class="how-lead">{{ t('how.lead') }}</p>
        <div class="flow">
          <div v-for="s in steps" :key="s" class="flow-step">
            <h3>{{ t(`how.${s}.title`) }}</h3>
            <p>{{ t(`how.${s}.desc`) }}</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
