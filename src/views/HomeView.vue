<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DataSource } from '@/services';
import type { Capability } from '@/types/capability';
import CapabilityCard from '@/components/CapabilityCard.vue';
import TrustBand from '@/components/TrustBand.vue';
const { t } = useI18n();
const ds = inject<DataSource>('dataSource')!;
const all = ref<Capability[]>([]);
onMounted(async () => {
  all.value = await ds.listCapabilities();
});
const featured = computed(() => all.value.filter(c => c.type !== 'skill').slice(0, 6));
const what = ['audience', 'private', 'mcp', 'real'] as const;
</script>
<template>
  <main>
    <section class="hero section">
      <div class="container">
        <h1 class="hero-title">{{ t('hero.title') }}</h1>
        <div class="hero-cta">
          <RouterLink class="btn btn-key" to="/catalog">{{ t('cta.browse') }}</RouterLink>
          <RouterLink class="btn btn-ghost ghost-on-dark" to="/console">{{
            t('nav.console')
          }}</RouterLink>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2>{{ t('section.what') }}</h2>
        <div class="what-grid">
          <div v-for="w in what" :key="w" class="what-card">
            <div class="what-dot"></div>
            <h3>{{ t(`what.${w}.title`) }}</h3>
            <p>{{ t(`what.${w}.desc`) }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="background: var(--bg-section)">
      <div class="container">
        <div class="row-between">
          <h2>{{ t('section.featured') }}</h2>
          <RouterLink to="/catalog">{{ t('home.viewAll') }}</RouterLink>
        </div>
        <div class="cap-grid"><CapabilityCard v-for="c in featured" :key="c.id" :cap="c" /></div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2>{{ t('section.trust') }}</h2>
        <TrustBand :capabilities="all" />
      </div>
    </section>
  </main>
</template>
