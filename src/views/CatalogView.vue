<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DataSource } from '@/services';
import type { Capability, Modality } from '@/types/capability';
import { filterCapabilities } from '@/lib/filters';
import CapabilityCard from '@/components/CapabilityCard.vue';
const { t } = useI18n();
const ds = inject<DataSource>('dataSource')!;
const all = ref<Capability[]>([]);
const q = ref('');
const modality = ref<Modality | ''>('');
onMounted(async () => {
  all.value = await ds.listCapabilities();
});
const mods: Array<Modality | ''> = ['', 'CT', 'MR', 'PET', 'X-ray', 'Cross'];
const result = computed(() =>
  filterCapabilities(all.value, { q: q.value, modality: modality.value })
);
</script>
<template>
  <main class="catalog-full">
    <div class="catalog-head">
      <h1>{{ t('catalog.title') }}</h1>
      <input v-model="q" class="cat-search" type="search" :placeholder="t('catalog.search')" />
    </div>
    <div class="catalog-body">
      <aside class="cat-side">
        <div class="side-label">{{ t('filter.modality') }}</div>
        <div class="side-chips">
          <button
            v-for="m in mods"
            :key="m"
            class="side-chip"
            :class="{ on: modality === m }"
            @click="modality = m"
          >
            {{ m || t('filter.all') }}
          </button>
        </div>
      </aside>
      <section class="catalog-results">
        <p class="cat-count">{{ result.length }} {{ t('catalog.count') }}</p>
        <div class="cap-grid"><CapabilityCard v-for="c in result" :key="c.id" :cap="c" /></div>
      </section>
    </div>
  </main>
</template>
