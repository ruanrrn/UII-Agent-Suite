<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{
  values: number[];
  labels: string[];
  color?: string;
  unit?: string;
}>();
const W = 360;
const H = 150;
const padL = 14;
const padR = 14;
const padTop = 14;
const padBottom = 26;
const stroke = computed(() => props.color || 'var(--brand)');

const geom = computed(() => {
  const vals = props.values;
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const span = max - min || 1;
  const innerW = W - padL - padR;
  const innerH = H - padTop - padBottom;
  const stepX = vals.length > 1 ? innerW / (vals.length - 1) : 0;
  const pts = vals.map((v, i) => {
    const x = padL + i * stepX;
    const y = padTop + innerH * (1 - (v - min) / span);
    return { x, y, v };
  });
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const base = padTop + innerH;
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)} ${base} L${pts[0].x.toFixed(1)} ${base} Z`;
  return { pts, line, area, base };
});
</script>
<template>
  <div class="chart-card">
    <svg :viewBox="`0 0 ${W} ${H}`" class="chart-svg" preserveAspectRatio="none">
      <!-- horizontal gridlines -->
      <line
        v-for="g in [0.25, 0.5, 0.75]"
        :key="g"
        :x1="padL"
        :x2="W - padR"
        :y1="padTop + (H - padTop - padBottom) * g"
        :y2="padTop + (H - padTop - padBottom) * g"
        class="chart-grid"
      />
      <path :d="geom.area" :fill="stroke" class="chart-area" />
      <path :d="geom.line" :stroke="stroke" class="chart-line" fill="none" />
      <circle
        v-for="(p, i) in geom.pts"
        :key="i"
        :cx="p.x"
        :cy="p.y"
        r="3"
        :fill="stroke"
        class="chart-dot"
      />
      <text
        v-for="(p, i) in geom.pts"
        :key="'lx' + i"
        :x="p.x"
        :y="H - 8"
        text-anchor="middle"
        class="chart-xlabel"
      >
        {{ labels[i] }}
      </text>
    </svg>
    <div class="chart-meta">
      <span class="chart-last" :style="{ color: stroke }">{{ values[values.length - 1] }}</span>
      <span class="chart-unit">{{ unit }}</span>
    </div>
  </div>
</template>
<style scoped>
.chart-card {
  position: relative;
}

.chart-svg {
  width: 100%;
  height: 150px;
  display: block;
}

.chart-grid {
  stroke: var(--border);
  stroke-width: 1;
}

.chart-area {
  opacity: 0.1;
}

.chart-line {
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.chart-dot {
  stroke: #fff;
  stroke-width: 1.5;
}

.chart-xlabel {
  font-family: var(--font-mono);
  font-size: 9px;
  fill: var(--ink-muted);
}

.chart-meta {
  position: absolute;
  top: 0;
  right: 4px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.chart-last {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
}

.chart-unit {
  font-size: 11px;
  color: var(--ink-muted);
}
</style>
