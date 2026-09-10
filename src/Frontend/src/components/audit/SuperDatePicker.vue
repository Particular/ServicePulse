<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAuditStore } from "@/stores/AuditStore";
import FAIcon from "@/components/FAIcon.vue";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { describeRangeText, formatLocal, formatUtc, isEmptyRange, loadDefaultRange, parseTimePoint, rangePresets, resolveTimeRange, saveDefaultRange, factoryDefaultRange } from "@/components/audit/timeRange";

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
  // Share the leading date when both bounds fall on it: "2026-09-03 07:55 to 13:55"
  const [fromDate, fromTime] = from.split(" ");
  const [toDate, toTime] = to.split(" ");
  return fromDate === toDate ? `${fromDate} ${fromTime} to ${toTime}` : `${from} to ${to}`;
}

const noSeconds = (formatted: string) => formatted.replace(/:\d{2}(Z?)$/, "$1");

// Feedback only when the draft cannot be applied; a valid draft speaks for itself
const problem = computed(() => {
  if (bothEmpty.value) return null;
  const fromError = fromText.value.trim() !== "" && fromParse.value.error;
  const toError = toText.value.trim() !== "" && toParse.value.error;
  if (fromError || toError) return `✗ ${fromError || toError}`;
  if (!resolveTimeRange({ from: fromText.value, to: toText.value })) return "✗ both bounds are needed (or clear both for no filter)";
  return null;
});

// Hovering the chip shows the applied window resolved in both UTC and local time
const chipTitle = computed(() => {
  const resolved = resolveTimeRange({ from: timeRangeFrom.value, to: timeRangeTo.value });
  if (!resolved) return "";
  return `${formatUtc(resolved.from)} to ${formatUtc(resolved.to)} · local ${formatLocal(resolved.from)} to ${formatLocal(resolved.to)}`;
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
  if (!resolved || resolved.live) return describeRangeText({ from, to });
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

/* popup: hand-rolled open/close, outside-click and Escape handling.
   Not the Popover API on purpose: a popover sits in the top layer, centred on the
   viewport, so placing it under the chip needs CSS anchor positioning, which Firefox
   ESR (a supported browser) does not have yet. Without that, the positioning script
   would cost what the dismiss handling saves. Revisit once anchor positioning is
   available in every supported browser. */
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

/* calendar per bound: the browser's own date picker (date only, so it closes on the day
   click in every browser) writes the day into the text field and keeps whatever time the
   field already says. Text stays the source of truth: relative expressions and pasted
   timestamps are typed; the calendar is one more way to fill a field in. */
type Bound = "from" | "to";
const fromPicker = useTemplateRef<HTMLInputElement>("fromPicker");
const toPicker = useTemplateRef<HTMLInputElement>("toPicker");

// type="date" wants "YYYY-MM-DD" in local time
const toDateLocal = (date: Date) => formatLocal(date).slice(0, 10);

function openCalendar(bound: Bound) {
  const picker = bound === "from" ? fromPicker.value : toPicker.value;
  if (!picker) return;
  const text = bound === "from" ? fromText.value : toText.value;
  // A relative bound opens on the day it currently resolves to; garbage opens on today
  picker.value = toDateLocal(parseTimePoint(text, bound === "to").date ?? new Date());
  if (typeof picker.showPicker === "function") {
    try {
      picker.showPicker();
      return;
    } catch {
      // not allowed here (no user activation, or unsupported for this type): fall back
    }
  }
  picker.focus();
  picker.click();
}

// "2026-09-01 08:05Z" -> date "2026-09-01", rest " 08:05Z" (separator and time kept as typed)
const absoluteText = /^\s*\d{4}-\d{2}-\d{2}([T ].*)$/;

function onPicked(bound: Bound, event: Event) {
  const day = (event.target as HTMLInputElement).value;
  if (day === "") return;
  const current = bound === "from" ? fromText.value : toText.value;
  const kept = absoluteText.exec(current)?.[1];
  // The field's own time survives a day change; otherwise From starts the day and To ends it
  const text = kept !== undefined ? `${day}${kept}` : bound === "from" ? `${day} 00:00:00` : `${day} 23:59:59`;
  if (bound === "from") fromText.value = text;
  else toText.value = text;
}

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
    <button type="button" class="btn btn-dropdown dropdown-toggle sp-btn-menu chip" :aria-expanded="open" aria-label="Time range" :title="chipTitle" @click="toggleOpen">
      {{ chipLabel }}
    </button>

    <div v-if="open" class="pop">
      <div class="editor">
        <div class="section-title">Absolute time range</div>
        <div class="field">
          <span class="field-label">From</span>
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
            <button type="button" class="cal" aria-label="Open a calendar for the start" title="Pick the day from a calendar" @click="openCalendar('from')"><FAIcon :icon="faCalendarDays" /></button>
            <input ref="fromPicker" type="date" class="native-picker" tabindex="-1" aria-hidden="true" @input="onPicked('from', $event)" @change="onPicked('from', $event)" />
          </div>
        </div>
        <div class="field">
          <span class="field-label">To</span>
          <div class="bar">
            <input v-model="toText" class="bound" :class="{ invalid: toText.trim() !== '' && toParse.error }" spellcheck="false" autocomplete="off" aria-label="Time range end" placeholder="now" @keydown.enter="apply" @paste="onPaste" />
            <button type="button" class="cal" aria-label="Open a calendar for the end" title="Pick the day from a calendar" @click="openCalendar('to')"><FAIcon :icon="faCalendarDays" /></button>
            <input ref="toPicker" type="date" class="native-picker" tabindex="-1" aria-hidden="true" @input="onPicked('to', $event)" @change="onPicked('to', $event)" />
          </div>
        </div>
        <p class="hint">
          Relative: <code>now-6h</code>, <code>now-1d/d</code> (keeps sliding with auto-refresh). Absolute: <code>YYYY-MM-DD HH:mm</code> is read as local time; add <code>Z</code> for UTC or an offset such as <code>+02:00</code>. Pasted ISO 8601
          timestamps work as they are.
        </p>
        <div v-if="problem" class="echo bad" role="alert">{{ problem }}</div>
        <button type="button" class="go" :disabled="!isValid || !isDirty" @click="apply">Apply time range</button>

        <div class="default-config">
          <span class="default-label">Default when opening this view:</span>
          <code>{{ describeRangeText(currentDefault) }}</code>
          <button v-if="!isCurrentTheDefault" type="button" class="mini" @click="saveCurrentAsDefault">Save current range as default</button>
          <span v-else-if="justSaved" class="saved">✓ Saved in this browser</span>
          <span v-else class="saved muted">current range is the default</span>
          <button v-if="!isFactoryDefault" type="button" class="mini" @click="resetDefault">Reset to last 6 hours</button>
        </div>
      </div>

      <div class="quick">
        <div class="section-title">Quick ranges</div>
        <button v-for="preset in rangePresets" :key="preset.label" type="button" class="quick-item" @click="applyPreset(preset.from, preset.to)">
          {{ preset.label }}
        </button>
        <button type="button" class="quick-item muted" @click="clearRange">No time filter</button>
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
  width: min(600px, 92vw);
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  /* Grafana-style: the absolute editor on the left, the quick ranges listed on the right */
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
}

@media (max-width: 36rem) {
  .pop {
    grid-template-columns: 1fr;
  }
}

.editor {
  padding: 0.9rem 1rem;
  border-right: 1px solid #e3e3e3;
}

.section-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: #333;
  margin-bottom: 0.6rem;
}

.field {
  margin-bottom: 0.6rem;
}

.field-label {
  display: block;
  font-size: 0.78rem;
  color: #555;
  margin-bottom: 0.2rem;
}

.bar {
  position: relative; /* anchors the hidden native pickers, so the browser opens them by the fields */
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

.cal {
  border: 0;
  border-left: 1px solid #ddd;
  background: none;
  color: #777;
  padding: 0 0.45rem;
  cursor: pointer;
}

.cal:hover {
  color: #00729c;
  background: #f3f9fb;
}

/* Kept in the flow (so the browser anchors its picker next to the field) but invisible */
.native-picker {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.go {
  display: inline-block;
  margin-top: 0.4rem;
  border: 0;
  border-radius: 4px;
  background: #00729c;
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.35rem 0.9rem;
  cursor: pointer;
}

.go:disabled {
  background: #e9e9e9;
  color: #999;
  cursor: default;
}

.hint {
  font-size: 0.74rem;
  line-height: 1.45;
  color: #6b6b6b;
  margin: 0.1rem 0 0.4rem;
}

.hint code {
  font-size: 0.72rem;
  color: #444;
}

.echo.bad {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.72rem;
  line-height: 1.35;
  color: #ce4844;
  margin-top: 0.3rem;
  overflow-wrap: break-word;
}

.quick {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 11rem;
  padding: 0.9rem 0.8rem;
}

.quick-item {
  border: 0;
  background: none;
  text-align: left;
  color: #00729c;
  padding: 0.28rem 0.5rem;
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
