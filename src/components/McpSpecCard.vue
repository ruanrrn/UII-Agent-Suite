<script setup lang="ts">
defineProps<{ name: string; desc: string; rows: Array<[string, string]> }>();
</script>
<template>
  <div class="spec-card">
    <span class="spec-name">{{ name }}</span>
    <p class="spec-desc">{{ desc }}</p>
    <div v-for="[k, v] in rows" :key="k" class="spec-row">
      <span class="spec-k">{{ k }}</span
      ><code>{{ v }}</code>
    </div>
  </div>
</template>
