<script setup lang="ts">
import { computed } from "vue";
import { useTimelineDiagramStore } from "@/stores/TimelineDiagramStore";
import { storeToRefs } from "pinia";
import { generateTimeTicks, generateWallClockTicks, timeToX, AXIS_HEIGHT, ROW_HEIGHT } from "@/resources/TimelineDiagram/TimelineModel";

const props = withDefaults(
  defineProps<{
    chartWidth: number;
    position?: "top" | "bottom";
    bottomY?: number;
  }>(),
  { position: "top" }
);

const store = useTimelineDiagramStore();
const { visibleMinTime, visibleMaxTime, rows, useUtc, labelWidth } = storeToRefs(store);

const isBottom = computed(() => props.position === "bottom");

const ticks = computed(() =>
  isBottom.value
    ? generateWallClockTicks(visibleMinTime.value, visibleMaxTime.value, useUtc.value)
    : generateTimeTicks(visibleMinTime.value, visibleMaxTime.value)
);

const axisY = computed(() => (isBottom.value ? props.bottomY! : AXIS_HEIGHT));
const totalHeight = computed(() => AXIS_HEIGHT + rows.value.length * ROW_HEIGHT);

function tickX(timeMs: number) {
  return labelWidth.value + timeToX(timeMs, visibleMinTime.value, visibleMaxTime.value, props.chartWidth);
}
</script>

<template>
  <g class="timeline-axis">
    <!-- axis line -->
    <line :x1="labelWidth" :y1="axisY" :x2="labelWidth + chartWidth" :y2="axisY" class="axis-line" />
    <!-- ticks and labels -->
    <g v-for="tick in ticks" :key="tick.timeMs">
      <line :x1="tickX(tick.timeMs)" :y1="isBottom ? axisY : axisY - 4" :x2="tickX(tick.timeMs)" :y2="isBottom ? axisY + 4 : axisY" class="tick-mark" />
      <!-- Bottom axis: two-line label (date + time) -->
      <text v-if="isBottom" :x="tickX(tick.timeMs)" :y="axisY + 14" class="tick-label">
        <tspan :x="tickX(tick.timeMs)" dy="0">{{ tick.label }}</tspan>
        <tspan :x="tickX(tick.timeMs)" dy="12">{{ tick.label2 }}</tspan>
      </text>
      <!-- Top axis: single-line label -->
      <text v-else :x="tickX(tick.timeMs)" :y="axisY - 8" class="tick-label">{{ tick.label }}</text>
      <!-- gridlines only for top axis -->
      <line v-if="!isBottom" :x1="tickX(tick.timeMs)" :y1="AXIS_HEIGHT" :x2="tickX(tick.timeMs)" :y2="totalHeight" class="gridline" />
    </g>
  </g>
</template>

<style scoped>
.axis-line {
  stroke: var(--gray80);
  stroke-width: 1;
}
.tick-mark {
  stroke: var(--gray60);
  stroke-width: 1;
}
.tick-label {
  font-size: 10px;
  fill: var(--gray40);
  text-anchor: middle;
}
.gridline {
  stroke: var(--gray90);
  stroke-width: 1;
  stroke-dasharray: 2 4;
}
</style>
