<script setup lang="ts">
import type { Capability } from '@/types/capability';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { capabilityToMarkdown } from '@/lib/catalogFormat';
const props = defineProps<{ cap: Capability }>();
const { t, locale } = useI18n();
const cfg = computed(() =>
  JSON.stringify(
    {
      mcpServers: {
        [props.cap.mcp.serverKey]: {
          url: props.cap.mcp.endpointUrl,
          // eslint-disable-next-line no-template-curly-in-string
          headers: { Authorization: 'Bearer ${UII_API_KEY}' }
        }
      }
    },
    null,
    2
  )
);
const cfgLabel = ref('');
const mdLabel = ref('');
async function copyText(s: string) {
  try {
    await navigator.clipboard.writeText(s);
  } catch {
    /* ignore */
  }
}
async function copyCfg() {
  await copyText(cfg.value);
  cfgLabel.value = t('copy.done');
  setTimeout(() => (cfgLabel.value = ''), 1500);
}
async function copyMd() {
  await copyText(capabilityToMarkdown(props.cap, locale.value as 'zh' | 'en'));
  mdLabel.value = t('copy.done');
  setTimeout(() => (mdLabel.value = ''), 1500);
}
</script>
<template>
  <div>
    <div class="cfg-acts top">
      <button class="btn btn-key" type="button" @click="copyCfg">
        {{ cfgLabel || t('detail.copyConfig') }}
      </button>
      <button class="btn btn-ghost" type="button" @click="copyMd">
        {{ mdLabel || t('detail.copyMd') }}
      </button>
    </div>
    <pre class="cfg-code">{{ cfg }}</pre>
    <p class="cfg-note">{{ t('detail.configNote') }}</p>
    <div class="cfg-disc">
      <b>🔎 {{ t('detail.discoveryLabel') }}</b>
      <span>{{ t('detail.discovery') }}</span>
      <code>/llms.txt</code><code>/catalog.json</code>
    </div>
  </div>
</template>
