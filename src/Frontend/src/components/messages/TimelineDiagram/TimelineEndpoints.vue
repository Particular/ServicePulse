<script setup lang="ts">
import { useTimelineDiagramStore } from "@/stores/TimelineDiagramStore";
import { storeToRefs } from "pinia";
import { AXIS_HEIGHT, ROW_HEIGHT, type TimelineRow } from "@/resources/TimelineDiagram/TimelineModel";

defineProps<{
  chartWidth: number;
}>();

const store = useTimelineDiagramStore();
const { rows, bars, labelWidth } = storeToRefs(store);

function rowY(rowIndex: number) {
  return AXIS_HEIGHT + rowIndex * ROW_HEIGHT;
}

function onRowClick(row: TimelineRow, event: MouseEvent) {
  const bar = bars.value.find((b) => b.id === row.barId);
  if (bar) store.navigateTo(bar, event.shiftKey);
}
</script>

<template>
  <g class="timeline-rows">
    <g v-for="row in rows" :key="row.barId" class="row-group" @click="onRowClick(row, $event)">
      <!-- alternating row background -->
      <rect :x="0" :y="rowY(row.rowIndex)" :width="labelWidth + chartWidth" :height="ROW_HEIGHT" :class="['row-bg', { alt: row.rowIndex % 2 === 1 }]" />
      <!-- separator line -->
      <line :x1="0" :y1="rowY(row.rowIndex) + ROW_HEIGHT" :x2="labelWidth + chartWidth" :y2="rowY(row.rowIndex) + ROW_HEIGHT" class="row-separator" />
      <!-- row label: type name + endpoint, indented by depth, with tree guides -->
      <foreignObject :x="4" :y="rowY(row.rowIndex)" :width="labelWidth - 8" :height="ROW_HEIGHT">
        <div class="row-label" :style="{ paddingLeft: `${row.depth * 16}px` }">
          <!-- Tree connector lines -->
          <template v-if="row.depth > 0">
            <!-- Vertical pass-through lines for ancestor depths -->
            <span v-for="(show, i) in row.continuations" :key="`v${i}`" v-show="show" class="tree-vline" :style="{ left: `${i * 16 + 7}px` }" />
            <!-- Branch connector (├── or └──) at parent's depth column -->
            <span class="tree-branch" :class="{ last: row.isLastChild }" :style="{ left: `${(row.depth - 1) * 16 + 7}px` }" />
          </template>
          <div class="row-type-name">{{ row.typeName }}</div>
          <div class="row-endpoint-name">{{ row.endpointName }}</div>
        </div>
      </foreignObject>
    </g>
    <!-- vertical separator between labels and chart -->
    <line :x1="labelWidth" :y1="AXIS_HEIGHT" :x2="labelWidth" :y2="AXIS_HEIGHT + rows.length * ROW_HEIGHT" class="label-separator" />
  </g>
</template>

<style scoped>
.row-group {
  cursor: pointer;
}
.row-bg {
  fill: white;
}
.row-bg.alt {
  fill: #f9f9f9;
}
.row-group:hover .row-bg {
  fill: #f0f5ff;
}
.row-group:hover .row-bg.alt {
  fill: #e8f0ff;
}
.row-separator {
  stroke: var(--gray90);
  stroke-width: 1;
}
.label-separator {
  stroke: var(--gray80);
  stroke-width: 1;
}
.row-label {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  overflow: hidden;
}
.row-type-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--gray20);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}
.row-endpoint-name {
  font-size: 9px;
  color: var(--gray60);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}
/* Tree connector: vertical pass-through line */
.tree-vline {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
  border-left: 1px solid #ccc;
}
/* Tree connector: branch (├── or └──) */
.tree-branch {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 9px;
}
.tree-branch::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  border-left: 1px solid #ccc;
}
.tree-branch::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  border-top: 1px solid #ccc;
}
/* Not last child: vertical line runs full height (├) */
.tree-branch:not(.last)::before {
  bottom: 0;
}
/* Last child: vertical line runs to midpoint (└) */
.tree-branch.last::before {
  bottom: 50%;
}
</style>
