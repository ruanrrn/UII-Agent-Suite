<script setup lang="ts">
import { ref, computed, inject, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import type { DataSource } from '@/services';
import type { Capability } from '@/types/capability';
import { filterCapabilities } from '@/lib/filters';
import CapabilityCard from '@/components/CapabilityCard.vue';
const props = defineProps<{ embedded?: boolean }>();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const ds = inject<DataSource>('dataSource')!;
const all = ref<Capability[]>([]);
const q = ref('');
type SkillCategory = 'triage' | 'image-analysis' | 'example';
const categories: SkillCategory[] = ['triage', 'image-analysis', 'example'];
const isSkillCategory = (value: unknown): value is SkillCategory =>
  typeof value === 'string' && categories.includes(value as SkillCategory);
const categoryFromRoute = () =>
  isSkillCategory(route.query.category) ? route.query.category : 'triage';
const activeCategory = ref<SkillCategory>(categoryFromRoute());
const triageIds = new Set(['easy-triage-ich', 'easy-triage-rib']);
const imageAnalysisIds = new Set([
  'bony-thorax-fractures',
  'aortic-dissection',
  'cerebral-carotid-vessels',
  'coronary-cta',
  'lower-extremity-cta',
  'intracerebral-hemorrhage'
]);
const categoryIds: Record<SkillCategory, Set<string>> = {
  'triage': triageIds,
  'image-analysis': imageAnalysisIds,
  'example': new Set(['vitallens-rppg'])
};
const skillRank = (cap: Capability) => (cap.id === 'easy-triage-ich' ? -1 : 0);
onMounted(async () => {
  all.value = await ds.listCapabilities();
});
watch(
  () => route.query.category,
  () => {
    activeCategory.value = categoryFromRoute();
  }
);
function setCategory(category: SkillCategory) {
  activeCategory.value = category;
  const query = {
    ...route.query,
    ...(props.embedded && route.name === 'home' ? { screen: 'market' } : {}),
    category
  };
  void router.replace({ query });
}
const result = computed(() =>
  filterCapabilities(all.value, { q: q.value })
    .filter(c => c.visible === true)
    .filter(c => categoryIds[activeCategory.value].has(c.id))
    .sort((a, b) => skillRank(a) - skillRank(b))
);
</script>
<template>
  <main class="catalog-full" :class="{ embedded }">
    <div class="catalog-head">
      <h1>{{ t('catalog.title') }}</h1>
      <input v-model="q" class="cat-search" type="search" :placeholder="t('catalog.search')" />
    </div>
    <div class="catalog-body catalog-body--flat">
      <section class="catalog-results">
        <div class="catalog-tools">
          <div class="category-tags" aria-label="Skill categories">
            <button
              v-for="category in categories"
              :key="category"
              class="category-tag"
              :class="{ on: activeCategory === category }"
              type="button"
              :aria-pressed="activeCategory === category"
              @click="setCategory(category)"
            >
              {{ t(`catalog.category.${category}`) }}
            </button>
          </div>
          <p class="cat-count">{{ result.length }} {{ t('catalog.count') }}</p>
        </div>
        <div class="cap-grid"><CapabilityCard v-for="c in result" :key="c.id" :cap="c" /></div>
      </section>
    </div>
  </main>
</template>
