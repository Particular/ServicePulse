import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { createTimelineModel, measureLabelWidth, type TimelineBar, type TimelineRow } from "@/resources/TimelineDiagram/TimelineModel";
import { useMessageStore } from "./MessageStore";
import { useRouter } from "vue-router";
import routeLinks from "@/router/routeLinks";
import { MessageStatus } from "@/resources/Message";

const STORAGE_KEY_UTC = "servicepulse-timeline-useUtc";
const STORAGE_KEY_DELIVERY_TIME = "servicepulse-timeline-showDeliveryTime";
const STORAGE_KEY_CONNECTIONS = "servicepulse-timeline-showConnections";

export const useTimelineDiagramStore = defineStore("TimelineDiagramStore", () => {
  const messageStore = useMessageStore();
  const { state, conversationData } = storeToRefs(messageStore);
  const router = useRouter();

  const bars = ref<TimelineBar[]>([]);
  const rows = ref<TimelineRow[]>([]);
  const minTime = ref(0);
  const maxTime = ref(0);
  const highlightId = ref<string>();
  const useUtc = ref(localStorage.getItem(STORAGE_KEY_UTC) === "true");
  const showDeliveryTime = ref(localStorage.getItem(STORAGE_KEY_DELIVERY_TIME) !== "false");
  const showConnections = ref(localStorage.getItem(STORAGE_KEY_CONNECTIONS) === "true");

  // Zoom state: visible window expressed as fractions [0..1] of the full time range
  const zoomStart = ref(0);
  const zoomEnd = ref(1);

  const isLoading = computed(() => conversationData.value.loading);
  const failedToLoad = computed(() => conversationData.value.failed_to_load === true);
  const selectedId = computed(() => state.value.data.id);
  const labelWidth = computed(() => measureLabelWidth(rows.value));
  const conversationId = computed(() => state.value.data.conversation_id ?? "");

  // The visible time window after zoom
  const visibleMinTime = computed(() => {
    const range = maxTime.value - minTime.value;
    return minTime.value + zoomStart.value * range;
  });
  const visibleMaxTime = computed(() => {
    const range = maxTime.value - minTime.value;
    return minTime.value + zoomEnd.value * range;
  });

  // Tooltip state — managed here so the parent component can render it as HTML outside SVG
  const tooltipBar = ref<TimelineBar | null>(null);
  const tooltipX = ref(0);
  const tooltipY = ref(0);

  // barId → rowIndex lookup for O(1) access from child components
  const rowIndexByBarId = computed(() => new Map(rows.value.map((r) => [r.barId, r.rowIndex])));

  watch(useUtc, (v) => localStorage.setItem(STORAGE_KEY_UTC, String(v)));
  watch(showDeliveryTime, (v) => localStorage.setItem(STORAGE_KEY_DELIVERY_TIME, String(v)));
  watch(showConnections, (v) => localStorage.setItem(STORAGE_KEY_CONNECTIONS, String(v)));

  watch(
    () => conversationData.value.data,
    (data) => {
      if (data.length) {
        const model = createTimelineModel(data, state.value.data.id);
        bars.value = model.bars;
        rows.value = model.rows;
        minTime.value = model.minTime;
        maxTime.value = model.maxTime;
      }
    },
    { immediate: true }
  );

  function setHighlightId(id?: string) {
    highlightId.value = id;
  }

  function showTooltip(bar: TimelineBar, x: number, y: number) {
    tooltipBar.value = bar;
    tooltipX.value = x;
    tooltipY.value = y;
  }

  function hideTooltip() {
    tooltipBar.value = null;
  }

  function toggleUtc() {
    useUtc.value = !useUtc.value;
  }

  function toggleDeliveryTime() {
    showDeliveryTime.value = !showDeliveryTime.value;
  }

  function toggleConnections() {
    showConnections.value = !showConnections.value;
  }

  function resetZoom() {
    zoomStart.value = 0;
    zoomEnd.value = 1;
  }

  function setZoomWindow(start: number, end: number) {
    zoomStart.value = Math.max(0, start);
    zoomEnd.value = Math.min(1, end);
  }

  function zoom(factor: number, anchorFraction: number) {
    const currentSpan = zoomEnd.value - zoomStart.value;
    const newSpan = Math.min(Math.max(currentSpan * factor, 0.001), 1);

    // Anchor the zoom around the cursor position
    const anchor = zoomStart.value + anchorFraction * currentSpan;
    let newStart = anchor - anchorFraction * newSpan;
    let newEnd = anchor + (1 - anchorFraction) * newSpan;

    // Clamp to [0, 1]
    if (newStart < 0) {
      newEnd = Math.min(newEnd - newStart, 1);
      newStart = 0;
    }
    if (newEnd > 1) {
      newStart = Math.max(newStart - (newEnd - 1), 0);
      newEnd = 1;
    }

    zoomStart.value = newStart;
    zoomEnd.value = newEnd;
  }

  function refreshConversation() {
    if (messageStore.state.data.conversation_id) messageStore.loadConversation(messageStore.state.data.conversation_id);
  }

  function navigateTo(bar: TimelineBar, newTab = false) {
    const status = conversationData.value.data.find((m) => m.id === bar.id)?.status;
    const isFailed = status === MessageStatus.Failed || status === MessageStatus.RepeatedFailure || status === MessageStatus.ArchivedFailure;
    const path = isFailed ? routeLinks.messages.failedMessage.link(bar.id) : routeLinks.messages.successMessage.link(bar.messageId, bar.id);

    if (newTab) {
      window.open(`#${path}`, "_blank");
    } else {
      router.push({ path });
    }
  }

  return {
    bars,
    rows,
    rowIndexByBarId,
    minTime,
    maxTime,
    visibleMinTime,
    visibleMaxTime,
    highlightId,
    failedToLoad,
    selectedId,
    labelWidth,
    conversationId,
    isLoading,
    useUtc,
    showDeliveryTime,
    showConnections,
    zoomStart,
    zoomEnd,
    tooltipBar,
    tooltipX,
    tooltipY,
    setHighlightId,
    showTooltip,
    hideTooltip,
    toggleUtc,
    toggleDeliveryTime,
    toggleConnections,
    resetZoom,
    setZoomWindow,
    zoom,
    refreshConversation,
    navigateTo,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTimelineDiagramStore, import.meta.hot));
}

export type TimelineDiagramStore = ReturnType<typeof useTimelineDiagramStore>;
