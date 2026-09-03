<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAuditStore } from "@/stores/AuditStore";
import { formatLocal, formatUtc, isEmptyRange, loadDefaultRange, parseTimePoint, rangePresets, resolveTimeRange, saveDefaultRange, factoryDefaultRange } from "@/components/audit/timeRange";

const store = useAuditStore();
const { timeRangeFrom, timeRangeTo } = storeToRefs(store);

// Drafts: edits are local until applied, so typing doesn't fire queries
const fromText = ref(timeRangeFrom.value);
const toText = ref(timeRangeTo.value);
watch([timeRangeFrom, timeRangeTo], ([from, to]) => {
  fromText.value = from;
  toText.value = to;
});

const fromParse = computed(() => parseTimePoint(fromText.value, false));
const toParse = computed(() => parseTimePoint(toText.value, true));
const bothEmpty = computed(() => isEmptyRange({ from: fromText.value, to: toText.value }));
const isValid = computed(() => bothEmpty.value || (!fromParse.value.error && !toParse.value.error));
const isDirty = computed(() => fromText.value !== timeRangeFrom.value || toText.value !== timeRangeTo.value);

function compactPair(from: string, to: string) {
  // Share the leading date when both bounds fall on it: "2026-09-03 07:55 → 13:55"
  const [fromDate, fromTime] = from.split(" ");
  const [toDate, toTime] = to.split(" ");
  return fromDate === toDate ? `${fromDate} ${fromTime} → ${toTime}` : `${from} → ${to}`;
}

const noSeconds = (formatted: string) => formatted.replace(/:\d{2}(Z?)$/, "$1");

const echo = computed(() => {
  if (bothEmpty.value) return { ok: true, text: "no time filter — the whole audit retention window", title: "" };
  const fromError = fromText.value.trim() !== "" && fromParse.value.error;
  const toError = toText.value.trim() !== "" && toParse.value.error;
  if (fromError || toError) return { ok: false, text: `✗ ${fromError || toError}`, title: "" };
  const resolved = resolveTimeRange({ from: fromText.value, to: toText.value });
  if (!resolved) return { ok: false, text: "✗ both bounds are needed (or clear both for no filter)", title: "" };
  const utc = compactPair(noSeconds(formatUtc(resolved.from).replace("T", " ")), noSeconds(formatUtc(resolved.to).replace("T", " ")));
  const local = compactPair(noSeconds(formatLocal(resolved.from)), noSeconds(formatLocal(resolved.to)));
  return {
    ok: true,
    text: `UTC ${utc} · local ${local}${resolved.live ? " · live" : ""}`,
    title: `${formatUtc(resolved.from)} → ${formatUtc(resolved.to)} · local ${formatLocal(resolved.from)} → ${formatLocal(resolved.to)}`,
  };
});

// The collapsed chip: a range is read far more often than it is edited, so the
// closed state costs one label. Preset name when the applied expressions match
// one, the raw expressions while a bound is live, a compact resolved range otherwise.
const chipLabel = computed(() => {
  const from = timeRangeFrom.value;
  const to = timeRangeTo.value;
  if (isEmptyRange({ from, to })) return "No time filter";
  const preset = rangePresets.find((p) => p.from === from && p.to === to);
  if (preset) return preset.label;
  const resolved = resolveTimeRange({ from, to });
  if (!resolved || resolved.live) return `${from} → ${to}`;
  return compactPair(noSeconds(formatLocal(resolved.from)), noSeconds(formatLocal(resolved.to)));
});

function apply() {
  if (!isValid.value) return;
  timeRangeFrom.value = fromText.value.trim();
  timeRangeTo.value = toText.value.trim();
  open.value = false;
}

function applyPreset(from: string, to: string) {
  fromText.value = from;
  toText.value = to;
  apply();
}

function clearRange() {
  applyPreset("", "");
}

// A pasted interval lands in one field; split "from/to" (ISO 8601), "a - b", "a to b"
function onPaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData("text") ?? "";
  for (const separator of ["/", " - ", " — ", " → ", " to "]) {
    const index = text.indexOf(separator);
    if (index > 0) {
      const a = text.slice(0, index).trim();
      const b = text.slice(index + separator.length).trim();
      if (!parseTimePoint(a, false).error && !parseTimePoint(b, true).error) {
        event.preventDefault();
        fromText.value = a;
        toText.value = b;
        return;
      }
    }
  }
}

/* popover */
const open = ref(false);
const root = useTemplateRef<HTMLElement>("root");
const fromInput = useTemplateRef<HTMLInputElement>("fromInput");

async function toggleOpen() {
  open.value = !open.value;
  if (open.value) {
    // Discard unapplied edits from a previous visit
    fromText.value = timeRangeFrom.value;
    toText.value = timeRangeTo.value;
    await nextTick();
    fromInput.value?.focus();
  }
}

function onOutsidePointer(event: PointerEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false;
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") open.value = false;
}
onMounted(() => document.addEventListener("pointerdown", onOutsidePointer));
onBeforeUnmount(() => document.removeEventListener("pointerdown", onOutsidePointer));

/* configurable default range (persisted per browser in localStorage) */
const currentDefault = ref(loadDefaultRange());
const isFactoryDefault = computed(() => currentDefault.value.from === factoryDefaultRange.from && currentDefault.value.to === factoryDefaultRange.to);
const isCurrentTheDefault = computed(() => currentDefault.value.from === timeRangeFrom.value && currentDefault.value.to === timeRangeTo.value);
const justSaved = ref(false);
let savedFeedbackTimer: number | undefined;
function saveCurrentAsDefault() {
  const range = { from: timeRangeFrom.value, to: timeRangeTo.value };
  saveDefaultRange(range);
  currentDefault.value = range;
  justSaved.value = true;
  window.clearTimeout(savedFeedbackTimer);
  savedFeedbackTimer = window.setTimeout(() => (justSaved.value = false), 2000);
}
function resetDefault() {
  saveDefaultRange(null);
  currentDefault.value = { ...factoryDefaultRange };
}
</script>

<template>
  <div class="super-date-picker" ref="root" @keydown="onKeydown">
    <button type="button" class="btn btn-dropdown dropdown-toggle sp-btn-menu chip" :aria-expanded="open" aria-label="Time range" :title="echo.title" @click="toggleOpen">
      {{ chipLabel }}
    </button>

    <div v-if="open" class="pop">
      <div class="editor">
        <div class="bar">
          <input
            ref="fromInput"
            v-model="fromText"
            class="bound"
            :class="{ invalid: fromText.trim() !== '' && fromParse.error }"
            spellcheck="false"
            autocomplete="off"
            aria-label="Time range start"
            placeholder="now-6h or 2026-09-01 08:00Z"
            @keydown.enter="apply"
            @paste="onPaste"
          />
          <span class="arrow" aria-hidden="true">→</span>
          <input v-model="toText" class="bound" :class="{ invalid: toText.trim() !== '' && toParse.error }" spellcheck="false" autocomplete="off" aria-label="Time range end" placeholder="now" @keydown.enter="apply" @paste="onPaste" />
          <button type="button" class="go" :disabled="!isValid || !isDirty" @click="apply">Apply</button>
        </div>
        <div class="echo" :class="{ bad: !echo.ok }" :title="echo.title">{{ echo.text }}</div>
      </div>

      <div class="quick">
        <button v-for="preset in rangePresets" :key="preset.label" type="button" class="quick-item" @click="applyPreset(preset.from, preset.to)">
          {{ preset.label }}
        </button>
        <button type="button" class="quick-item muted" @click="clearRange">No time filter</button>
      </div>

      <div class="default-config">
        <span class="default-label">Default when opening this view:</span>
        <code>{{ currentDefault.from }} → {{ currentDefault.to }}</code>
        <button v-if="!isCurrentTheDefault" type="button" class="mini" @click="saveCurrentAsDefault">Save current range as default</button>
        <span v-else-if="justSaved" class="saved">✓ Saved in this browser</span>
        <span v-else class="saved muted">current range is the default</span>
        <button v-if="!isFactoryDefault" type="button" class="mini" @click="resetDefault">Reset to last 6 hours</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.super-date-picker {
  position: relative;
  display: inline-block;
}

.chip {
  white-space: nowrap;
}

.pop {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 200;
  width: min(480px, 92vw);
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  padding: 0.9rem 1rem;
}

.editor {
  border-bottom: 1px solid #e3e3e3;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
}

.bar {
  display: flex;
  align-items: stretch;
  border: 1px solid #aaa;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.bound {
  border: 0;
  padding: 0.3rem 0.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85rem;
  flex: 1 1 10ch;
  width: auto;
  min-width: 7ch;
}

.bound:focus {
  outline: 2px solid #00729c;
  outline-offset: -2px;
}

.bound.invalid {
  background: #fdecec;
}

.arrow {
  align-self: center;
  color: #777;
  padding: 0 0.15rem;
}

.go {
  border: 0;
  border-left: 1px solid #ccc;
  background: #00729c;
  color: #fff;
  font-weight: 600;
  padding: 0 0.8rem;
  cursor: pointer;
}

.go:disabled {
  background: #e9e9e9;
  color: #999;
  cursor: default;
}

.echo {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.72rem;
  line-height: 1.35;
  color: #6b6b6b;
  margin-top: 0.3rem;
  min-height: 1em;
  overflow-wrap: break-word;
}

.echo.bad {
  color: #ce4844;
}

.quick {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem 1rem;
}

.quick-item {
  border: 0;
  background: none;
  text-align: left;
  color: #00729c;
  padding: 0.22rem 0.3rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.86rem;
}

.quick-item:hover {
  background: #e6f2f6;
}

.quick-item.muted {
  color: #777;
}

.default-config {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  border-top: 1px solid #e3e3e3;
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  font-size: 0.78rem;
  color: #6b6b6b;
}

.default-config code {
  font-size: 0.75rem;
}

.mini {
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 4px;
  padding: 0.15rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
}

.mini:hover {
  border-color: #00729c;
  color: #00729c;
}

.saved {
  color: #2b8a3e;
  font-size: 0.75rem;
}

.saved.muted {
  color: #999;
  font-style: italic;
}
</style>
