<script setup lang="ts">
import type { MonthlyThroughput } from "@/resources/EndpointThroughputSummary";
import { computed } from "vue";

const props = defineProps<{ data: MonthlyThroughput[] }>();

const date = new Date();
date.setMonth(date.getMonth() - 13);
const reportPeriod = Array.from({ length: 13 }).map((_) => {
  date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
});

const maxValue = computed(() => Math.max(...[...props.data.map(({ throughput }) => throughput), 1]));
const maxValueText = computed(() => {
  if (maxValue.value >= 1_000_000) return `${(Math.round((maxValue.value * 10) / 1_000_000) / 10 + 0.1).toFixed(1)}m`;
  if (maxValue.value >= 10_000) return `${(Math.round((maxValue.value * 100) / 1_000) / 100 + 0.01).toFixed(2)}k`;
  return maxValue.value;
});
const lines = computed(() =>
  props.data
    .slice(0, -1)
    .map(({ month, throughput }, index) => {
      const x1 = reportPeriod.indexOf(month);
      const y1 = 1 - throughput / maxValue.value;
      const { month: nextMonth, throughput: nextValue } = props.data[index + 1];
      const x2 = reportPeriod.indexOf(nextMonth);
      if (x2 !== x1 + 1) return null;
      const y2 = 1 - nextValue / maxValue.value;
      const isPartMonth = x1 === 0 || x2 === reportPeriod.length - 1;
      return { x1, y1, x2, y2, isPartMonth };
    })
    .filter((x) => x != null)
);
const dots = computed(() =>
  props.data.map(({ month, throughput }) => ({
    pip: reportPeriod.indexOf(month),
    value: throughput,
  }))
);
</script>

<template>
  <div class="graph" :style="{ '--pips': reportPeriod.length * 2 }">
    <div class="graph-content">
      <svg class="graph-content" :viewBox="`-0.2 -0.03 ${reportPeriod.length * 2 + 0.1} 1.07`" preserveAspectRatio="none">
        <line v-for="{ x1, y1, x2, y2, isPartMonth } in lines" :x1="x1 * 2" :y1="y1" :x2="x2 * 2" :y2="y2" stroke="var(--bs-primary)" stroke-width="1" :stroke-dasharray="isPartMonth ? 4 : 0" vector-effect="non-scaling-stroke" />
        <line v-for="(_, pip) in reportPeriod" :x1="pip * 2" y1="1.07" :x2="pip * 2" y2="1" stroke="var(--bs-body-color)" stroke-width="1" vector-effect="non-scaling-stroke" />
        <g v-for="{ pip, value } in dots">
          <title>{{ value.toLocaleString() }}</title>
          <path r="1" :cx="pip * 2" :cy="1 - value / maxValue" :d="`M ${pip * 2} ${1 - value / maxValue} l 0.0001 0`" vector-effect="non-scaling-stroke" stroke-width="5" stroke-linecap="round" :stroke="value === 0 ? 'red' : 'var(--bs-primary)'" />
        </g>
      </svg>
      <div class="y-axis">
        <span v-for="pip in reportPeriod">{{ pip }}</span>
      </div>
    </div>
    <div class="scale">
      <span>{{ maxValueText }}</span>
      <span>0</span>
    </div>
  </div>
</template>

<style scoped>
.graph {
  display: flex;
  width: calc(var(--pips) * 1rem + 2rem);
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 5px;
  padding: 3px;
  padding-left: 1rem;
}

.graph-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.graph-content .y-axis {
  display: flex;
  justify-content: space-between;
  font-size: 0.5rem;
  height: 2rem;
}

.graph-content .y-axis span {
  transform-origin: 100% 80%;
  transform: translateX(-0.4rem) translateY(-0.5rem) rotate(-45deg);
}

.scale {
  width: 2rem;
  margin-left: -1rem;
  height: calc(100% - 2rem);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 0.5rem;
}
</style>
