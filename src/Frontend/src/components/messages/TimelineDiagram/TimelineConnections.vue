<script setup lang="ts">
import { computed } from "vue";
import { useTimelineDiagramStore } from "@/stores/TimelineDiagramStore";
import { storeToRefs } from "pinia";
import { timeToX, rowToY, BAR_HEIGHT } from "@/resources/TimelineDiagram/TimelineModel";

const props = defineProps<{
  chartWidth: number;
}>();

const store = useTimelineDiagramStore();
const { bars, rowIndexByBarId, visibleMinTime, visibleMaxTime, labelWidth } = storeToRefs(store);

interface Connection {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const connections = computed<Connection[]>(() => {
  const barsByMessageId = new Map(bars.value.map((b) => [b.messageId, b]));
  const result: Connection[] = [];

  for (const child of bars.value) {
    if (!child.relatedToMessageId) continue;
    const parent = barsByMessageId.get(child.relatedToMessageId);
    if (!parent) continue;

    const parentRowIdx = rowIndexByBarId.value.get(parent.id) ?? 0;
    const childRowIdx = rowIndexByBarId.value.get(child.id) ?? 0;

    // Line from parent's processedAt to child's processing start (box start)
    const x1 = labelWidth.value + timeToX(parent.processedAtMs, visibleMinTime.value, visibleMaxTime.value, props.chartWidth);
    const y1 = rowToY(parentRowIdx) + BAR_HEIGHT / 2;
    const x2 = labelWidth.value + timeToX(child.processingStartMs, visibleMinTime.value, visibleMaxTime.value, props.chartWidth);
    const y2 = rowToY(childRowIdx) + BAR_HEIGHT / 2;

    result.push({ key: `${parent.id}-${child.id}`, x1, y1, x2, y2 });
  }

  return result;
});
</script>

<template>
  <g class="timeline-connections">
    <line v-for="conn in connections" :key="conn.key" :x1="conn.x1" :y1="conn.y1" :x2="conn.x2" :y2="conn.y2" class="connection-line" />
  </g>
</template>

<style scoped>
.connection-line {
  stroke: var(--gray60);
  stroke-width: 1;
  stroke-dasharray: 3 3;
  pointer-events: none;
}
</style>
