<script setup lang="ts">
import { computed } from "vue";
import { useTimelineDiagramStore } from "@/stores/TimelineDiagramStore";
import { storeToRefs } from "pinia";
import { timeToX, rowToY, BAR_HEIGHT, MIN_BAR_WIDTH, DELIVERY_LINE_HEIGHT, type TimelineBar } from "@/resources/TimelineDiagram/TimelineModel";

const props = defineProps<{
  chartWidth: number;
}>();

const store = useTimelineDiagramStore();
const { bars, rowIndexByBarId, visibleMinTime, visibleMaxTime, highlightId, showDeliveryTime, labelWidth } = storeToRefs(store);

const barPositions = computed(() =>
  bars.value.map((bar) => {
    const rowIndex = rowIndexByBarId.value.get(bar.id) ?? 0;
    const y = rowToY(rowIndex);

    // Delivery line: sentMs → processingStartMs
    const deliveryX = labelWidth.value + timeToX(bar.sentMs, visibleMinTime.value, visibleMaxTime.value, props.chartWidth);
    const procStartX = labelWidth.value + timeToX(bar.processingStartMs, visibleMinTime.value, visibleMaxTime.value, props.chartWidth);
    const deliveryWidth = Math.max(procStartX - deliveryX, 0);

    // Processing bar: processingStartMs → processedAtMs
    const procEndX = labelWidth.value + timeToX(bar.processedAtMs, visibleMinTime.value, visibleMaxTime.value, props.chartWidth);
    const procWidth = Math.max(procEndX - procStartX, MIN_BAR_WIDTH);

    return { bar, y, deliveryX, deliveryWidth, procX: procStartX, procWidth };
  })
);

function barFill(bar: TimelineBar) {
  if (bar.isFailed) return "var(--error)";
  if (bar.isSelected) return "var(--highlight)";
  if (highlightId.value === bar.id) return "var(--highlight-background)";
  return "var(--gray80)";
}

function barTextFill(bar: TimelineBar) {
  if (bar.isFailed || bar.isSelected) return "white";
  return "var(--gray20)";
}

function deliveryLineFill(bar: TimelineBar) {
  if (bar.isFailed) return "var(--error)";
  if (bar.isSelected) return "var(--highlight)";
  if (highlightId.value === bar.id) return "var(--highlight-background)";
  return "var(--gray95)";
}

function onBarClick(bar: TimelineBar, event: MouseEvent) {
  store.navigateTo(bar, event.shiftKey);
}

function onBarEnter(bar: TimelineBar, event: MouseEvent) {
  store.setHighlightId(bar.id);
  updateTooltipPos(bar, event);
}

function onBarMove(bar: TimelineBar, event: MouseEvent) {
  updateTooltipPos(bar, event);
}

function onBarLeave() {
  store.setHighlightId(undefined);
  store.hideTooltip();
}

function updateTooltipPos(bar: TimelineBar, event: MouseEvent) {
  const wrapper = (event.currentTarget as SVGElement).closest(".wrapper");
  if (!wrapper) return;
  const rect = wrapper.getBoundingClientRect();
  store.showTooltip(bar, event.clientX - rect.left + 12, event.clientY - rect.top + 12);
}
</script>

<template>
  <g class="timeline-bars">
    <g v-for="pos in barPositions" :key="pos.bar.id" class="bar-group" @click="onBarClick(pos.bar, $event)" @mouseenter="onBarEnter(pos.bar, $event)" @mousemove="onBarMove(pos.bar, $event)" @mouseleave="onBarLeave">
      <!-- Delivery time line (thin) -->
      <rect
        v-if="showDeliveryTime && pos.deliveryWidth > 0"
        :x="pos.deliveryX"
        :y="pos.y + BAR_HEIGHT / 2 - DELIVERY_LINE_HEIGHT / 2"
        :width="pos.deliveryWidth"
        :height="DELIVERY_LINE_HEIGHT"
        :fill="deliveryLineFill(pos.bar)"
        class="delivery-line"
      />
      <!-- Processing time bar -->
      <rect :x="pos.procX" :y="pos.y" :width="pos.procWidth" :height="BAR_HEIGHT" :fill="barFill(pos.bar)" rx="3" ry="3" class="bar-rect" />
      <!-- Clipped text label inside the processing bar -->
      <clipPath :id="`clip-${pos.bar.id}`">
        <rect :x="pos.procX" :y="pos.y" :width="pos.procWidth - 4" :height="BAR_HEIGHT" />
      </clipPath>
      <text v-if="pos.procWidth > 30" :x="pos.procX + 4" :y="pos.y + BAR_HEIGHT / 2 + 4" :fill="barTextFill(pos.bar)" :clip-path="`url(#clip-${pos.bar.id})`" class="bar-label">
        {{ pos.bar.typeName }}
      </text>
    </g>
  </g>
</template>

<style scoped>
.bar-group {
  cursor: pointer;
}
.bar-rect {
  transition: opacity 0.15s;
}
.delivery-line {
  transition: opacity 0.15s;
}
.bar-group:hover .bar-rect,
.bar-group:hover .delivery-line {
  opacity: 0.85;
}
.bar-label {
  font-size: 10px;
  pointer-events: none;
}
</style>
