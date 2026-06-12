<script setup lang="ts">
import { computed } from 'vue';
interface Series {
  name: string;
  color: string;
  values: number[];
}
const props = defineProps<{ months: string[]; series: Series[]; unit?: string }>();

const W = 480;
const H = 210;
const padL = 16;
const padR = 16;
const padTop = 18;
const padBottom = 30;
const innerW = W - padL - padR;
const innerH = H - padTop - padBottom;

const totals = computed(() =>
  props.months.map((_, i) => props.series.reduce((s, ser) => s + (ser.values[i] || 0), 0))
);
const max = computed(() => Math.max(1, ...totals.value));
const stepX = computed(() => innerW / props.months.length);
const barW = computed(() => Math.min(44, stepX.value * 0.58));

const bars = computed(() =>
  props.months.map((_, i) => {
    const cx = padL + stepX.value * (i + 0.5);
    let acc = 0;
    const segs = props.series.map(ser => {
      const v = ser.values[i] || 0;
      const h = innerH * (v / max.value);
      const y = padTop + innerH - acc - h;
      acc += h;
      return { color: ser.color, y, h: Math.max(0, h), v };
    });
    return {
      cx,
      x: cx - barW.value / 2,
      segs,
      total: totals.value[i],
      yTop: padTop + innerH - acc
    };
  })
);
</script>
<template>
  <div class="sbar">
    <svg :viewBox="`0 0 ${W} ${H}`" class="sbar-svg" preserveAspectRatio="xMidYMid meet">
      <line
        v-for="g in [0, 0.25, 0.5, 0.75, 1]"
        :key="g"
        :x1="padL"
        :x2="W - padR"
        :y1="padTop + innerH * g"
        :y2="padTop + innerH * g"
        class="sbar-grid"
      />
      <template v-for="(b, i) in bars" :key="i">
        <rect
          v-for="(s, si) in b.segs"
          :key="si"
          :x="b.x"
          :y="s.y"
          :width="barW"
          :height="s.h"
          :rx="1.5"
          :fill="s.color"
          class="sbar-seg"
        />
        <text :x="b.cx" :y="b.yTop - 6" text-anchor="middle" class="sbar-total">{{ b.total }}</text>
        <text :x="b.cx" :y="H - 10" text-anchor="middle" class="sbar-x">{{ months[i] }}</text>
      </template>
    </svg>
    <div class="sbar-legend">
      <span v-for="s in series" :key="s.name" class="sbar-leg">
        <i :style="{ background: s.color }"></i>{{ s.name }}
      </span>
    </div>
  </div>
</template>
<style scoped>
.sbar-svg {
  width: 100%;
  height: auto;
  display: block;
}

.sbar-grid {
  stroke: var(--border);
  stroke-width: 1;
}

.sbar-seg {
  stroke: #fff;
  stroke-width: 0.75;
}

.sbar-total {
  font-family: var(--font-display);
  font-size: 9px;
  font-weight: 700;
  fill: var(--ink-2);
}

.sbar-x {
  font-family: var(--font-mono);
  font-size: 9px;
  fill: var(--ink-muted);
}

.sbar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-top: 12px;
}

.sbar-leg {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ink-2);
}

.sbar-leg i {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
}
</style>
