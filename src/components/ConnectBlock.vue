<script setup lang="ts">
import type { Capability } from '@/types/capability';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { capabilityToMarkdown } from '@/lib/catalogFormat';
const props = defineProps<{ cap: Capability }>();
const { t, locale } = useI18n();
const label = ref('');
async function copy() {
  const md = capabilityToMarkdown(props.cap, locale.value as 'zh' | 'en');
  try {
    await navigator.clipboard.writeText(md);
  } catch {
    /* ignore */
  }
  label.value = t('copy.done');
  setTimeout(() => (label.value = t('detail.copyMd')), 1500);
}
const rows = () => [
  ['MCP endpoint', props.cap.mcp.endpointUrl],
  ['Server key', props.cap.mcp.serverKey],
  // eslint-disable-next-line no-template-curly-in-string
  ['API Key', '${UII_API_KEY}']
];
</script>
<template>
  <div class="machine-block">
    <div class="mc-title">{{ t('detail.connect') }}</div>
    <div v-for="[k, v] in rows()" :key="k" class="mc-row">
      <span class="mc-k">{{ k }}</span
      ><code>{{ v }}</code>
    </div>
    <button class="mc-copy" type="button" @click="copy">{{ label || t('detail.copyMd') }}</button>
  </div>
</template>
