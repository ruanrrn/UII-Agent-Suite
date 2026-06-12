<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DataSource } from '@/services';
import type { Capability } from '@/types/capability';
import ConsoleShell from '@/components/ConsoleShell.vue';
import ConnectBlock from '@/components/ConnectBlock.vue';
const { t } = useI18n();
const ds = inject<DataSource>('dataSource')!;
const caps = ref<Capability[]>([]);
onMounted(async () => {
  caps.value = (await ds.listCapabilities()).filter(c => c.fda).slice(0, 5);
});

// Demo account credential — masked by default; never a real key
const apiKey = 'uii_sk_live_8f3a9c2e7b1d4f60a5e8c1d2';
const PREFIX = 'uii_sk_live_';
const shown = ref(false);
// Keep masked length identical to the real key so the row width never shifts
const masked = computed(() =>
  shown.value
    ? apiKey
    : `${PREFIX}${'•'.repeat(apiKey.length - PREFIX.length - 4)}${apiKey.slice(-4)}`
);
const copied = ref(false);
async function copyKey() {
  try {
    await navigator.clipboard.writeText(apiKey);
  } catch {
    /* ignore */
  }
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
}
</script>
<template>
  <ConsoleShell active="connect">
    <h1>{{ t('console.connect') }}</h1>
    <p style="color: var(--ink-3); max-width: 46em">{{ t('connect.lead') }}</p>

    <div class="cred-card">
      <div class="cred-head">🔑 {{ t('connect.credTitle') }}</div>
      <div class="cred-row">
        <span class="cred-k">{{ t('connect.region') }}</span>
        <code class="cred-val">{{ t('connect.regionVal') }}</code>
      </div>
      <div class="cred-row">
        <span class="cred-k">{{ t('connect.apiKey') }}</span>
        <code class="cred-val cred-key">{{ masked }}</code>
        <button class="cred-btn" type="button" @click="shown = !shown">
          {{ shown ? t('connect.hide') : t('connect.reveal') }}
        </button>
        <button class="cred-btn primary" type="button" @click="copyKey">
          {{ copied ? t('copy.done') : t('copy.label') }}
        </button>
        <button class="cred-btn" type="button" disabled>{{ t('connect.rotate') }}</button>
      </div>
      <p class="cred-note">{{ t('connect.credNote') }}</p>
    </div>

    <div class="connect-grid">
      <ConnectBlock v-for="c in caps" :key="c.id" :cap="c" />
    </div>
  </ConsoleShell>
</template>
