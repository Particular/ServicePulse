<script setup lang="ts">
import { computed, ref } from "vue";
import { useTimelineDiagramStore } from "@/stores/TimelineDiagramStore";
import { storeToRefs } from "pinia";
import type { TimelineBar } from "@/resources/TimelineDiagram/TimelineModel";

const MINIMAP_HEIGHT = 50;
const BAR_H = 3;

const store = useTimelineDiagramStore();
const { bars, rows, rowIndexByBarId, minTime, maxTime, zoomStart, zoomEnd } = storeToRefs(store);

const minimapRef = ref<HTMLDivElement>();
const range = computed(() => maxTime.value - minTime.value);

function barStyle(bar: TimelineBar): Record<string, string> {
  if (range.value <= 0) return { display: "none" };
  const rowIdx = rowIndexByBarId.value.get(bar.id) ?? 0;
  const totalRows = rows.value.length || 1;
  const left = ((bar.sentMs - minTime.value) / range.value) * 100;
  const width = Math.max(((bar.processedAtMs - bar.sentMs) / range.value) * 100, 0.3);
  const top = (rowIdx / totalRows) * (MINIMAP_HEIGHT - BAR_H);
  return {
    left: `${left}%`,
    width: `${width}%`,
    top: `${top}px`,
    height: `${BAR_H}px`,
    backgroundColor: bar.isFailed ? "#e74c3c" : bar.isSelected ? "#0b6eef" : "#999",
  };
}

let dragging = false;
let dragOffset = 0;

function onMouseDown(event: MouseEvent) {
  const el = minimapRef.value;
  if (!el) return;
  event.preventDefault();
  const rect = el.getBoundingClientRect();
  const fraction = (event.clientX - rect.left) / rect.width;
  const span = zoomEnd.value - zoomStart.value;

  if (fraction >= zoomStart.value && fraction <= zoomEnd.value) {
    dragging = true;
    dragOffset = fraction - zoomStart.value;
  } else {
    let newStart = fraction - span / 2;
    let newEnd = fraction + span / 2;
    if (newStart < 0) {
      newEnd -= newStart;
      newStart = 0;
    }
    if (newEnd > 1) {
      newStart -= newEnd - 1;
      newEnd = 1;
    }
    store.setZoomWindow(Math.max(0, newStart), Math.min(1, newEnd));
    dragging = true;
    dragOffset = span / 2;
  }
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(event: MouseEvent) {
  if (!dragging || !minimapRef.value) return;
  const rect = minimapRef.value.getBoundingClientRect();
  const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const span = zoomEnd.value - zoomStart.value;
  let newStart = fraction - dragOffset;
  let newEnd = newStart + span;
  if (newStart < 0) {
    newEnd -= newStart;
    newStart = 0;
  }
  if (newEnd > 1) {
    newStart -= newEnd - 1;
    newEnd = 1;
  }
  store.setZoomWindow(Math.max(0, newStart), Math.min(1, newEnd));
}

function onMouseUp() {
  dragging = false;
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
}
</script>

<template>
  <div ref="minimapRef" class="minimap" @mousedown="onMouseDown">
    <div v-for="bar in bars" :key="bar.id" class="minimap-bar" :style="barStyle(bar)" />
    <div class="minimap-dim minimap-dim-left" :style="{ width: `${zoomStart * 100}%` }" />
    <div class="minimap-dim minimap-dim-right" :style="{ width: `${(1 - zoomEnd) * 100}%` }" />
    <div class="minimap-window" :style="{ left: `${zoomStart * 100}%`, width: `${(zoomEnd - zoomStart) * 100}%` }" />
  </div>
</template>

<style scoped>
.minimap {
  position: relative;
  height: v-bind(MINIMAP_HEIGHT + 'px');
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;
  margin-bottom: 0.5rem;
  user-select: none;
}
.minimap-bar {
  position: absolute;
  border-radius: 1px;
  pointer-events: none;
}
.minimap-dim {
  position: absolute;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  pointer-events: none;
}
.minimap-dim-left {
  left: 0;
}
.minimap-dim-right {
  right: 0;
}
.minimap-window {
  position: absolute;
  top: 0;
  bottom: 0;
  border: 1.5px solid #0b6eef;
  border-radius: 2px;
  pointer-events: none;
  background: rgba(11, 110, 239, 0.04);
}
</style>
