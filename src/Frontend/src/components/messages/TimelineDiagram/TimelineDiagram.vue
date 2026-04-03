<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId, watch } from "vue";
import { useTimelineDiagramStore } from "@/stores/TimelineDiagramStore";
import { storeToRefs } from "pinia";
import { AXIS_HEIGHT, BOTTOM_AXIS_HEIGHT, ROW_HEIGHT, formatTimeForDisplay, formatDateTimeForDisplay, formatDurationForDisplay } from "@/resources/TimelineDiagram/TimelineModel";
import TimelineAxis from "./TimelineAxis.vue";
import TimelineEndpoints from "./TimelineEndpoints.vue";
import TimelineBars from "./TimelineBars.vue";
import TimelineConnections from "./TimelineConnections.vue";
import TimelineMinimap from "./TimelineMinimap.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const store = useTimelineDiagramStore();
const { bars, rows, isLoading, failedToLoad, useUtc, showDeliveryTime, showConnections, labelWidth, zoomStart, zoomEnd, minTime, maxTime, conversationId, tooltipBar, tooltipX, tooltipY } = storeToRefs(store);

const clipId = `chart-clip-${useId()}`;

const conversationDuration = computed(() => {
  const range = maxTime.value - minTime.value;
  return range > 0 ? formatDurationForDisplay(range) : "";
});

const conversationStart = computed(() => (minTime.value ? formatDateTimeForDisplay(minTime.value, useUtc.value) : ""));
const distinctEndpoints = computed(() => new Set(bars.value.map((b) => b.endpointName)).size);
const maxDepth = computed(() => (rows.value.length ? Math.max(...rows.value.map((r) => r.depth)) + 1 : 0));
const totalMessages = computed(() => bars.value.length);

const containerRef = ref<HTMLDivElement>();
const containerWidth = ref(800);
let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
  store.refreshConversation();
});

// Attach wheel listener and ResizeObserver when containerRef becomes available (it's behind v-else)
watch(containerRef, (el, oldEl) => {
  oldEl?.removeEventListener("wheel", onWheel);
  resizeObserver?.disconnect();
  if (el) {
    containerWidth.value = el.clientWidth;
    el.addEventListener("wheel", onWheel, { passive: false });
    resizeObserver = new ResizeObserver(([entry]) => {
      containerWidth.value = entry.contentRect.width;
    });
    resizeObserver.observe(el);
  }
});

onUnmounted(() => {
  containerRef.value?.removeEventListener("wheel", onWheel);
  resizeObserver?.disconnect();
});

const chartWidth = computed(() => Math.max(containerWidth.value - labelWidth.value, 400));
const svgWidth = computed(() => labelWidth.value + chartWidth.value);
const bottomAxisY = computed(() => AXIS_HEIGHT + rows.value.length * ROW_HEIGHT);
const svgHeight = computed(() => bottomAxisY.value + BOTTOM_AXIS_HEIGHT);

const isZoomed = computed(() => zoomStart.value > 0 || zoomEnd.value < 1);

function onWheel(event: WheelEvent) {
  event.preventDefault();

  const svgEl = containerRef.value?.querySelector("svg");
  if (!svgEl) return;

  const rect = svgEl.getBoundingClientRect();
  const mouseX = event.clientX - rect.left - labelWidth.value;
  const anchorFraction = Math.max(0, Math.min(1, mouseX / chartWidth.value));

  const factor = event.deltaY > 0 ? 1.15 : 1 / 1.15;
  store.zoom(factor, anchorFraction);
}
</script>

<template>
  <div class="wrapper">
    <!-- Stats header -->
    <div class="stats-header">
      <div class="stats-row">
        <span class="stat"><span class="stat-label">Start</span> {{ conversationStart }}</span>
        <span class="stat"><span class="stat-label">Duration</span> {{ conversationDuration }}</span>
        <span class="stat"><span class="stat-label">Endpoints</span> {{ distinctEndpoints }}</span>
        <span class="stat"><span class="stat-label">Depth</span> {{ maxDepth }}</span>
        <span class="stat"><span class="stat-label">Messages</span> {{ totalMessages }}</span>
      </div>
      <div v-if="conversationId" class="conversation-id" :title="conversationId">{{ conversationId }}</div>
    </div>
    <!-- Minimap overview -->
    <TimelineMinimap v-if="!isLoading && bars.length" />
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-controls">
        <button class="toolbar-btn" :class="{ active: useUtc }" :title="useUtc ? 'Showing UTC time' : 'Showing local time'" @click="store.toggleUtc()">
          {{ useUtc ? "UTC" : "Local" }}
        </button>
        <button class="toolbar-btn" :class="{ active: showDeliveryTime }" title="Show delivery time (queue wait + network transit)" @click="store.toggleDeliveryTime()">Delivery time</button>
        <button class="toolbar-btn" :class="{ active: showConnections }" title="Show connections between related messages" @click="store.toggleConnections()">Connections</button>
        <button v-if="isZoomed" class="toolbar-btn" @click="store.resetZoom()">Reset zoom</button>
      </div>
      <span class="zoom-hint">Scroll to zoom</span>
    </div>
    <LoadingSpinner v-if="isLoading" />
    <div v-else-if="failedToLoad" class="unavailable">Timeline data is unavailable.</div>
    <div v-else-if="!bars.length" class="unavailable">No messages in this conversation.</div>
    <div v-else ref="containerRef" class="outer">
      <svg class="timeline-diagram" :width="svgWidth" :height="svgHeight">
        <TimelineEndpoints :chart-width="chartWidth" />
        <clipPath :id="clipId">
          <rect :x="labelWidth" y="0" :width="chartWidth" :height="svgHeight" />
        </clipPath>
        <g :clip-path="`url(#${clipId})`">
          <TimelineAxis :chart-width="chartWidth" />
          <TimelineAxis :chart-width="chartWidth" position="bottom" :bottom-y="bottomAxisY" />
          <TimelineConnections v-if="showConnections" :chart-width="chartWidth" />
          <TimelineBars :chart-width="chartWidth" />
        </g>
      </svg>
    </div>
    <!-- Tooltip outside .outer to prevent clipping by overflow:auto -->
    <div v-if="tooltipBar" class="bar-tooltip" :style="{ left: `${tooltipX}px`, top: `${tooltipY}px` }">
      <div class="tooltip-title">{{ tooltipBar.typeName }}</div>
      <table class="tooltip-table">
        <tr>
          <td class="tooltip-label">Endpoint</td>
          <td>{{ tooltipBar.endpointName }}</td>
        </tr>
        <tr>
          <td class="tooltip-label">Sent</td>
          <td>{{ formatTimeForDisplay(tooltipBar.sentMs, useUtc) }}</td>
        </tr>
        <tr>
          <td class="tooltip-label">Processed</td>
          <td>{{ formatTimeForDisplay(tooltipBar.processedAtMs, useUtc) }}</td>
        </tr>
        <tr>
          <td class="tooltip-label">Critical time</td>
          <td>{{ formatDurationForDisplay(tooltipBar.criticalMs) }}</td>
        </tr>
        <tr>
          <td class="tooltip-label">Delivery time</td>
          <td>{{ formatDurationForDisplay(tooltipBar.deliveryMs) }}</td>
        </tr>
        <tr>
          <td class="tooltip-label">Processing time</td>
          <td>{{ formatDurationForDisplay(tooltipBar.processingMs) }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  margin-top: 5px;
  border-radius: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  background: white;
  display: flex;
  flex-direction: column;
}
.stats-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  padding: 4px 4px 6px;
  gap: 12px;
}
.stats-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.stat {
  font-size: 12px;
  color: #333;
}
.stat-label {
  font-size: 11px;
  color: #999;
  margin-right: 4px;
}
.conversation-id {
  font-size: 10px;
  color: #bbb;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
  flex-shrink: 1;
}
.toolbar {
  background-color: #f3f3f3;
  border: #8c8c8c 1px solid;
  border-radius: 3px;
  padding: 5px 8px;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-height: 32px;
  gap: 8px;
}
.toolbar-controls {
  display: flex;
  gap: 6px;
  align-items: center;
}
.toolbar-btn {
  padding: 3px 10px;
  border: 1px solid #aaa;
  border-radius: 3px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.toolbar-btn:hover {
  background: #e8e8e8;
}
.toolbar-btn.active {
  background: #0b6eef;
  color: white;
  border-color: #0b6eef;
}
.zoom-hint {
  font-size: 11px;
  color: #999;
}
.outer {
  position: relative;
  max-width: 100%;
  max-height: calc(100vh - 27rem);
  overflow: auto;
}
.timeline-diagram {
  --error: red;
  --gray20: #333333;
  --gray30: #444444;
  --gray40: #666666;
  --gray60: #999999;
  --gray80: #cccccc;
  --gray90: #e6e6e6;
  --gray95: #b3b3b3;
  --highlight: #0b6eef;
  --highlight-background: #c5dee9;
  background: white;
}
.bar-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 10;
  background: rgba(0, 0, 0, 0.88);
  color: white;
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 11px;
  line-height: 1.5;
  white-space: nowrap;
}
.tooltip-title {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 12px;
}
.tooltip-table {
  border-spacing: 0;
}
.tooltip-table td {
  padding: 0 6px 0 0;
  vertical-align: top;
}
.tooltip-label {
  color: #aaa;
}
.unavailable {
  padding: 2rem;
  text-align: center;
  color: #999;
  font-size: 13px;
}
</style>
