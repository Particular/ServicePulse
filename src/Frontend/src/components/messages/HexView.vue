<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import CopyToClipboard from "@/components/CopyToClipboard.vue";

const props = defineProps<{
  data: Uint8Array;
}>();

const LANE_SIZE = 8;
const ROW_HEIGHT = 20;
const OVERSCAN = 10;

const scrollContainer = ref<HTMLElement | null>(null);
const containerWidth = ref(0);
const containerHeight = ref(0);
const scrollTop = ref(0);
const charWidthPx = ref(7.8);

const selectionStart = ref<number | null>(null);
const selectionEnd = ref<number | null>(null);
const isSelecting = ref(false);

// Responsive: compute bytes per row as a multiple of LANE_SIZE based on available width
// Row layout in ch units: offset(8+2) + hex(bpr*3 + lanes-1)*laneSep) + separator(3) + ascii(bpr + (lanes-1)*0.5) + margin(2)
const bytesPerRow = computed(() => {
  const availablePx = containerWidth.value;
  if (availablePx === 0) return 16; // default before measurement
  const ch = charWidthPx.value;
  // Try multiples of LANE_SIZE from large to small
  for (const bpr of [48, 40, 32, 24, 16]) {
    const lanes = bpr / LANE_SIZE;
    // offset: 10ch, hex: bpr*3ch + (lanes-1)*1.5ch, sep: 3ch, ascii: bpr*1ch, margin: 2ch
    const needed = (10 + bpr * 3 + (lanes - 1) * 1.5 + 3 + bpr + 2) * ch;
    if (availablePx >= needed) return bpr;
  }
  return 8;
});

// Fixed width for hex bytes area (in ch) so all rows align including short last row
const hexAreaWidthCh = computed(() => {
  const bpr = bytesPerRow.value;
  const lanes = bpr / LANE_SIZE;
  // Each byte: 3ch (2 hex + 1 space). Each lane separator: 1.5ch. Minus trailing space on last byte.
  return bpr * 3 + (lanes - 1) * 1.5;
});

const totalRows = computed(() => Math.ceil(props.data.length / bytesPerRow.value));
const totalHeight = computed(() => totalRows.value * ROW_HEIGHT);

const visibleRange = computed(() => {
  const firstVisible = Math.floor(scrollTop.value / ROW_HEIGHT);
  const visibleCount = Math.ceil(containerHeight.value / ROW_HEIGHT);
  const start = Math.max(0, firstVisible - OVERSCAN);
  const end = Math.min(totalRows.value, firstVisible + visibleCount + OVERSCAN);
  return { start, end };
});

const offsetY = computed(() => visibleRange.value.start * ROW_HEIGHT);

const selectionMin = computed(() => {
  if (selectionStart.value === null || selectionEnd.value === null) return null;
  return Math.min(selectionStart.value, selectionEnd.value);
});

const selectionMax = computed(() => {
  if (selectionStart.value === null || selectionEnd.value === null) return null;
  return Math.max(selectionStart.value, selectionEnd.value);
});

function isSelected(byteIndex: number): boolean {
  if (selectionMin.value === null || selectionMax.value === null) return false;
  return byteIndex >= selectionMin.value && byteIndex <= selectionMax.value;
}

function isPrintableAscii(byte: number): boolean {
  return byte >= 0x20 && byte <= 0x7e;
}

function toHex2(byte: number): string {
  return byte.toString(16).toUpperCase().padStart(2, "0");
}

function toHex8(offset: number): string {
  return offset.toString(16).toUpperCase().padStart(8, "0");
}

function toAsciiChar(byte: number): string {
  return isPrintableAscii(byte) ? String.fromCharCode(byte) : ".";
}

// Returns true if this is the last byte in a lane (needs separator after it)
function isLaneEnd(posInRow: number): boolean {
  return posInRow % LANE_SIZE === LANE_SIZE - 1;
}

interface VisibleRow {
  offset: number;
  offsetHex: string;
  byteCount: number;
  bytes: { index: number; value: number; hex: string }[];
  chars: { index: number; value: number; printable: boolean; display: string }[];
}

const visibleRows = computed<VisibleRow[]>(() => {
  const rows: VisibleRow[] = [];
  const { start, end } = visibleRange.value;
  const bpr = bytesPerRow.value;

  for (let rowIdx = start; rowIdx < end; rowIdx++) {
    const offset = rowIdx * bpr;
    const rowEnd = Math.min(offset + bpr, props.data.length);
    const bytes: VisibleRow["bytes"] = [];
    const chars: VisibleRow["chars"] = [];

    for (let i = offset; i < rowEnd; i++) {
      const b = props.data[i];
      bytes.push({ index: i, value: b, hex: toHex2(b) });
      chars.push({ index: i, value: b, printable: isPrintableAscii(b), display: toAsciiChar(b) });
    }

    rows.push({ offset, offsetHex: toHex8(offset), byteCount: rowEnd - offset, bytes, chars });
  }

  return rows;
});

function onScroll() {
  if (!scrollContainer.value) return;
  scrollTop.value = scrollContainer.value.scrollTop;
}

function measureContainer() {
  if (!scrollContainer.value) return;
  containerHeight.value = scrollContainer.value.clientHeight;
  containerWidth.value = scrollContainer.value.clientWidth;
}

function startSelection(byteIndex: number) {
  selectionStart.value = byteIndex;
  selectionEnd.value = byteIndex;
  isSelecting.value = true;
}

function extendSelection(byteIndex: number) {
  if (!isSelecting.value) return;
  selectionEnd.value = byteIndex;
}

function endSelection() {
  isSelecting.value = false;
}

function onDocumentMouseUp() {
  endSelection();
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  document.addEventListener("mouseup", onDocumentMouseUp);

  // Measure monospace char width
  const measurer = document.createElement("span");
  measurer.style.fontFamily = '"Cascadia Code", "Fira Code", "JetBrains Mono", "Consolas", "Courier New", monospace';
  measurer.style.fontSize = "13px";
  measurer.style.position = "absolute";
  measurer.style.visibility = "hidden";
  measurer.textContent = "0".repeat(100);
  document.body.appendChild(measurer);
  charWidthPx.value = measurer.offsetWidth / 100;
  document.body.removeChild(measurer);

  measureContainer();
  if (scrollContainer.value) {
    resizeObserver = new ResizeObserver(measureContainer);
    resizeObserver.observe(scrollContainer.value);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("mouseup", onDocumentMouseUp);
  resizeObserver?.disconnect();
});

watch(
  () => props.data,
  () => {
    selectionStart.value = null;
    selectionEnd.value = null;
  }
);

const selectedText = computed(() => {
  if (selectionMin.value === null || selectionMax.value === null) return "";
  const slice = props.data.slice(selectionMin.value, selectionMax.value + 1);
  const hexParts: string[] = [];
  const asciiParts: string[] = [];
  for (let i = 0; i < slice.length; i++) {
    hexParts.push(toHex2(slice[i]));
    asciiParts.push(toAsciiChar(slice[i]));
  }
  return hexParts.join(" ") + "  |" + asciiParts.join("") + "|";
});

const copyText = computed(() => {
  if (selectedText.value) return selectedText.value;
  const limit = Math.min(props.data.length, 65536);
  const lines: string[] = [];
  const bpr = bytesPerRow.value;
  for (let offset = 0; offset < limit; offset += bpr) {
    const end = Math.min(offset + bpr, limit);
    const hexParts: string[] = [];
    const asciiParts: string[] = [];
    for (let i = offset; i < end; i++) {
      hexParts.push(toHex2(props.data[i]));
      asciiParts.push(toAsciiChar(props.data[i]));
    }
    while (hexParts.length < bpr) hexParts.push("  ");
    // Group into lanes
    const hexLanes: string[] = [];
    for (let l = 0; l < bpr; l += LANE_SIZE) {
      hexLanes.push(hexParts.slice(l, l + LANE_SIZE).join(" "));
    }
    lines.push(`${toHex8(offset)}  ${hexLanes.join("  ")}  |${asciiParts.join("")}|`);
  }
  if (props.data.length > limit) {
    lines.push(`... (${props.data.length - limit} more bytes)`);
  }
  return lines.join("\n");
});
</script>

<template>
  <div class="hex-view-wrapper">
    <div class="hex-toolbar">
      <span class="encoding-label">Encoding: US-ASCII</span>
      <CopyToClipboard :value="copyText" />
    </div>
    <div v-if="data.length === 0" class="hex-empty">No data</div>
    <div v-else ref="scrollContainer" class="hex-scroll-container" @scroll="onScroll">
      <div class="hex-spacer" :style="{ height: totalHeight + 'px' }">
        <div class="hex-rows" :style="{ transform: `translateY(${offsetY}px)` }">
          <div v-for="row in visibleRows" :key="row.offset" class="hex-row">
            <span class="hex-offset">{{ row.offsetHex }}</span>
            <span class="hex-bytes" :style="{ minWidth: hexAreaWidthCh + 'ch' }">
              <!-- Render all bytesPerRow slots to ensure consistent width -->
              <template v-for="pos in bytesPerRow" :key="pos">
                <span
                  v-if="pos <= row.byteCount"
                  class="hex-byte"
                  :class="{ 'null-byte': row.bytes[pos - 1].value === 0, selected: isSelected(row.bytes[pos - 1].index) }"
                  @mousedown.prevent="startSelection(row.bytes[pos - 1].index)"
                  @mouseover="extendSelection(row.bytes[pos - 1].index)"
                  >{{ row.bytes[pos - 1].hex }}</span
                >
                <span v-else class="hex-byte pad">&nbsp;&nbsp;</span>
                <span v-if="isLaneEnd(pos - 1) && pos < bytesPerRow" class="hex-lane-sep"></span>
              </template>
            </span>
            <span class="hex-ascii">
              <span
                v-for="(char, i) in row.chars"
                :key="char.index"
                class="ascii-char"
                :class="{ 'non-printable': !char.printable, selected: isSelected(char.index), 'lane-start': i > 0 && i % LANE_SIZE === 0 }"
                @mousedown.prevent="startSelection(char.index)"
                @mouseover="extendSelection(char.index)"
                >{{ char.display }}</span
              >
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hex-view-wrapper {
  margin-top: 5px;
  border-radius: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  background: white;
  display: flex;
  flex-direction: column;
}

.hex-toolbar {
  background-color: #f3f3f3;
  border: #8c8c8c 1px solid;
  border-radius: 3px;
  padding: 5px;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.encoding-label {
  font-family: monospace;
  font-size: 0.85em;
  color: var(--reduced-emphasis, #929e9e);
}

.hex-empty {
  padding: 1rem;
  color: var(--reduced-emphasis, #929e9e);
  font-style: italic;
}

.hex-scroll-container {
  overflow-y: auto;
  overflow-x: auto;
  flex: 1 1 0;
  min-height: 200px;
  max-height: 70vh;
}

.hex-spacer {
  position: relative;
}

.hex-rows {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}

.hex-row {
  height: 20px;
  line-height: 20px;
  font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", "Consolas", "Courier New", monospace;
  font-size: 13px;
  white-space: nowrap;
  display: flex;
  user-select: none;
}

.hex-offset {
  color: #6a737d;
  margin-right: 2ch;
  flex-shrink: 0;
}

.hex-bytes {
  flex-shrink: 0;
  margin-right: 1.5ch;
}

.hex-byte {
  display: inline-block;
  width: 3ch;
  text-align: center;
  cursor: pointer;
}

.hex-byte:not(.pad):hover {
  background-color: #e8f0fe;
  border-radius: 2px;
}

.hex-byte.pad {
  cursor: default;
}

/* Lane separator between 8-byte groups in hex area */
.hex-lane-sep {
  display: inline-block;
  width: 1.5ch;
  border-left: 1px dotted #d0d0d0;
  margin-left: 0.25ch;
  height: 14px;
  vertical-align: middle;
}

.hex-ascii {
  flex-shrink: 0;
  border-left: 1px solid #ccc;
  padding-left: 1.5ch;
}

.ascii-char {
  cursor: pointer;
}

.ascii-char:hover {
  background-color: #e8f0fe;
}

/* Lane boundary marker in ASCII area — thin border, no added width */
.ascii-char.lane-start {
  border-left: 1px dotted #d0d0d0;
}

/* Null bytes (0x00): dim gray */
.null-byte {
  color: #c0c0c0;
}

/* Non-printable characters: dim gray */
.non-printable {
  color: #c0c0c0;
}

/* Selection highlight */
.selected {
  background-color: #b3d4fc;
  border-radius: 2px;
}
</style>
