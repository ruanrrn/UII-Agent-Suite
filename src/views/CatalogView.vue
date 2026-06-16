<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DataSource } from '@/services';
import type { Capability } from '@/types/capability';
import { filterCapabilities } from '@/lib/filters';
import CapabilityCard from '@/components/CapabilityCard.vue';
defineProps<{ embedded?: boolean }>();
const { t } = useI18n();
const ds = inject<DataSource>('dataSource')!;
const all = ref<Capability[]>([]);
const q = ref('');
onMounted(async () => {
  all.value = await ds.listCapabilities();
});
const result = computed(() => filterCapabilities(all.value, { q: q.value }));
</script>
<template>
  <main class="catalog-full" :class="{ embedded }">
    <div class="catalog-head">
      <h1>{{ t('catalog.title') }}</h1>
      <input v-model="q" class="cat-search" type="search" :placeholder="t('catalog.search')" />
    </div>
    <div class="catalog-body catalog-body--flat">
      <section class="catalog-results">
        <p class="cat-count">{{ result.length }} {{ t('catalog.count') }}</p>
        <div class="cap-grid"><CapabilityCard v-for="c in result" :key="c.id" :cap="c" /></div>
      </section>
    </div>
  </main>
</template>
