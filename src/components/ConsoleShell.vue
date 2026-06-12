<script setup lang="ts">
import { useI18n } from 'vue-i18n';
defineProps<{ active: 'index' | 'services' | 'connect' | 'usage' }>();
const { t } = useI18n();
const nav: Array<['index' | 'services' | 'connect' | 'usage', string, string]> = [
  ['index', '/console', 'console.dashboard'],
  ['services', '/console/services', 'console.services'],
  ['connect', '/console/connect', 'console.connect'],
  ['usage', '/console/usage', 'console.usage']
];
</script>
<template>
  <div class="cn-wrap">
    <aside class="cn-side">
      <nav>
        <RouterLink
          v-for="[k, to, key] in nav"
          :key="k"
          class="cn-link"
          :class="{ on: k === active }"
          :to="to"
          >{{ t(key) }}</RouterLink
        >
      </nav>
    </aside>
    <main class="cn-main">
      <slot />
    </main>
  </div>
</template>
