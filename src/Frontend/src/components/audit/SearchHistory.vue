<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch, watchEffect } from "vue";
import { storeToRefs } from "pinia";
import { useAuditStore } from "@/stores/AuditStore";
import type { SearchHistoryEntry } from "@/components/audit/searchHistory";
import TimeSince from "@/components/TimeSince.vue";
import { describeRangeText } from "@/components/audit/timeRange";

// Wraps the search field (default slot) and floats the recent searches below it while
// the field has focus, the way a browser's address bar does. Entries carry the whole
// query (text, endpoint, time range), so they are listed with all of it.
//
// It behaves as a combobox: the entries are not tab stops; Arrow Up/Down move a
// highlight, Enter reruns the highlighted entry, Escape and Tab close, and so does focus
// leaving the field and the panel. Submitting a search (Enter, or the debounced text
// reaching the store) closes it too: once results show, the history is out of the way
// until the user types again.

const store = useAuditStore();
const { searchHistory, messageFilterString, selectedEndpointName, timeRangeFrom, timeRangeTo } = storeToRefs(store);

const open = ref(false);
// What is being typed right now (the store value trails it by the input's debounce)
const typed = ref("");
const highlighted = ref(-1);
const root = useTemplateRef<HTMLElement>("root");
const listId = useId();

const matching = computed(() => {
  const needle = typed.value.trim().toLowerCase();
  if (needle === "") return searchHistory.value;
  return searchHistory.value.filter((entry) => entry.search.toLowerCase().includes(needle) || entry.endpoint.toLowerCase().includes(needle));
});
const visible = computed(() => open.value && matching.value.length > 0);
const optionId = (index: number) => `${listId}-option-${index}`;

watch([matching, open], () => (highlighted.value = -1));

function isSearchField(target: EventTarget | null): target is HTMLInputElement {
  return target instanceof HTMLInputElement;
}

function onFocusIn(event: FocusEvent) {
  if (isSearchField(event.target)) {
    typed.value = event.target.value;
    open.value = true;
  }
}

function onFocusOut(event: FocusEvent) {
  // Focus moving anywhere outside the field and the panel closes it (Tab away, a click elsewhere)
  const next = event.relatedTarget as Node | null;
  if (next && root.value?.contains(next)) return;
  open.value = false;
}

function onClick(event: MouseEvent) {
  // Re-opens after Escape without having to leave and re-enter the field
  if (isSearchField(event.target)) open.value = true;
}

function onInput(event: Event) {
  if (isSearchField(event.target)) {
    typed.value = event.target.value;
    open.value = true;
  }
}

function rerun(entry: SearchHistoryEntry) {
  messageFilterString.value = entry.search;
  selectedEndpointName.value = entry.endpoint;
  // Restoring the range makes this a true "run this again"; entries recorded
  // before ranges were captured leave the current range alone
  if (entry.from !== undefined && entry.to !== undefined) {
    timeRangeFrom.value = entry.from;
    timeRangeTo.value = entry.to;
  }
  typed.value = entry.search;
  open.value = false;
}

// The query inputs reaching the store means the search was submitted: results are (about
// to be) on screen and the panel has done its job. Auto-refresh does not touch these.
watch([messageFilterString, selectedEndpointName, timeRangeFrom, timeRangeTo], () => (open.value = false));

function rangeLabel(entry: SearchHistoryEntry): string | null {
  if (entry.from === undefined || entry.to === undefined) return null;
  if (entry.from === "" && entry.to === "") return "no time filter";
  return describeRangeText({ from: entry.from, to: entry.to });
}

function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case "ArrowDown":
      if (matching.value.length === 0) return;
      event.preventDefault();
      if (!open.value) {
        open.value = true;
        highlighted.value = 0;
      } else {
        highlighted.value = Math.min(highlighted.value + 1, matching.value.length - 1);
      }
      return;
    case "ArrowUp":
      if (!visible.value) return;
      event.preventDefault();
      highlighted.value = Math.max(highlighted.value - 1, -1);
      return;
    case "Enter":
      if (visible.value && highlighted.value >= 0) {
        event.preventDefault();
        rerun(matching.value[highlighted.value]);
      } else {
        open.value = false; // the search itself is submitted by the field
      }
      return;
    case "Escape":
    case "Tab":
      open.value = false;
      return;
  }
}

// Not the Popover API: this panel behaves like a combobox and must stay open while the
// field it belongs to has focus or is clicked, whereas a popover's light dismiss treats a
// click on that field as a click outside. (And, as for the date picker, a popover would
// need anchor positioning, which Firefox ESR does not have yet.)
function onOutsidePointer(event: PointerEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false;
}
onMounted(() => document.addEventListener("pointerdown", onOutsidePointer));
onBeforeUnmount(() => document.removeEventListener("pointerdown", onOutsidePointer));

// The field comes in through the slot, so its combobox semantics are set from here
const field = ref<HTMLInputElement | null>(null);
onMounted(() => {
  field.value = root.value?.querySelector("input") ?? null;
  field.value?.setAttribute("role", "combobox");
  field.value?.setAttribute("aria-autocomplete", "list");
  field.value?.setAttribute("aria-haspopup", "listbox");
  field.value?.setAttribute("aria-controls", listId);
});
watchEffect(() => {
  if (!field.value) return;
  field.value.setAttribute("aria-expanded", String(visible.value));
  if (visible.value && highlighted.value >= 0) field.value.setAttribute("aria-activedescendant", optionId(highlighted.value));
  else field.value.removeAttribute("aria-activedescendant");
});
</script>

<template>
  <div class="search-history" ref="root" @focusin="onFocusIn" @focusout="onFocusOut" @click="onClick" @input="onInput" @keydown="onKeydown">
    <slot />

    <div v-if="visible" :id="listId" class="pop" role="listbox" aria-label="Recent searches">
      <div class="head">Recent searches</div>
      <button
        v-for="(entry, index) in matching"
        :id="optionId(index)"
        :key="`${entry.search}|${entry.endpoint}|${entry.from}|${entry.to}`"
        type="button"
        role="option"
        tabindex="-1"
        class="entry"
        :class="{ highlighted: index === highlighted }"
        :aria-selected="index === highlighted"
        title="Run this search again"
        @mouseenter="highlighted = index"
        @click="rerun(entry)"
      >
        <span class="what">
          <span v-if="entry.search" class="term">{{ entry.search }}</span>
          <span v-else class="term muted">(no search text)</span>
          <span v-if="entry.endpoint" class="endpoint">@ {{ entry.endpoint }}</span>
          <span v-if="rangeLabel(entry)" class="range">{{ rangeLabel(entry) }}</span>
        </span>
        <span class="when"><TimeSince :date-utc="entry.at" /></span>
      </button>
      <div class="foot">
        <button type="button" class="clear" tabindex="-1" @click="store.clearSearchHistory()">Clear history</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-history {
  position: relative;
}

.pop {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 200;
  width: 100%;
  min-width: min(420px, 92vw);
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  padding: 0.4rem;
}

.head {
  color: #777;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.15rem 0.5rem 0.3rem;
}

.entry {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.8rem;
  width: 100%;
  border: 0;
  background: none;
  text-align: left;
  padding: 0.35rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.entry:hover,
.entry:focus-visible,
.entry.highlighted {
  background: #e6f2f6;
}

.what {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.term {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85rem;
  color: #333;
}

.term.muted {
  color: #999;
  font-style: italic;
  font-family: inherit;
}

.endpoint {
  color: #00729c;
  font-size: 0.8rem;
  margin-left: 0.4rem;
}

.range {
  color: #999;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.72rem;
  margin-left: 0.4rem;
}

.when {
  color: #999;
  font-size: 0.75rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.foot {
  border-top: 1px solid #e3e3e3;
  margin-top: 0.3rem;
  padding-top: 0.35rem;
  text-align: right;
}

.clear {
  border: 0;
  background: none;
  color: #999;
  font-size: 0.75rem;
  cursor: pointer;
}

.clear:hover {
  color: #ce4844;
}
</style>
