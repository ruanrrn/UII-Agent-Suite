<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
const err = ref<Error | null>(null);
onErrorCaptured(e => {
  err.value = e as Error;
  return false;
});
</script>
<template>
  <div v-if="err" class="empty">⚠ {{ err.message }}</div>
  <slot v-else />
</template>
