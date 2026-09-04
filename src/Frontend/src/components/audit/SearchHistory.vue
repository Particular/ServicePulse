<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";
import { storeToRefs } from "pinia";
import { useAuditStore } from "@/stores/AuditStore";
import type { SearchHistoryEntry } from "@/components/audit/searchHistory";
import TimeSince from "@/components/TimeSince.vue";

const store = useAuditStore();
const { searchHistory, messageFilterString, selectedEndpointName, timeRangeFrom, timeRangeTo } = storeToRefs(store);

const open = ref(false);
const root = useTemplateRef<HTMLElement>("root");

function rerun(entry: SearchHistoryEntry) {
  messageFilterString.value = entry.search;
  selectedEndpointName.value = entry.endpoint;
  // Restoring the range makes this a true "run this again"; entries recorded
  // before ranges were captured leave the current range alone
  if (entry.from !== undefined && entry.to !== undefined) {
    timeRangeFrom.value = entry.from;
    timeRangeTo.value = entry.to;
  }
  open.value = false;
}

function rangeLabel(entry: SearchHistoryEntry): string | null {
  if (entry.from === undefined || entry.to === undefined) return null;
  if (entry.from === "" && entry.to === "") return "no time filter";
  return `${entry.from} → ${entry.to}`;
}

function onOutsidePointer(event: PointerEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false;
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") open.value = false;
}
onMounted(() => document.addEventListener("pointerdown", onOutsidePointer));
onBeforeUnmount(() => document.removeEventListener("pointerdown", onOutsidePointer));
</script>

<template>
  <div class="search-history" ref="root" @keydown="onKeydown">
    <button type="button" class="trigger" :aria-expanded="open" aria-label="Search history" @click="open = !open">History ▾</button>

    <div v-if="open" class="pop">
      <template v-if="searchHistory.length > 0">
        <button v-for="entry in searchHistory" :key="`${entry.search}|${entry.endpoint}|${entry.from}|${entry.to}`" type="button" class="entry" :title="'Run this search again'" @click="rerun(entry)">
          <span class="what">
            <span v-if="entry.search" class="term">{{ entry.search }}</span>
            <span v-else class="term muted">(no search text)</span>
            <span v-if="entry.endpoint" class="endpoint">@ {{ entry.endpoint }}</span>
            <span v-if="rangeLabel(entry)" class="range">{{ rangeLabel(entry) }}</span>
          </span>
          <span class="when"><TimeSince :date-utc="entry.at" /></span>
        </button>
        <div class="foot">
          <button type="button" class="clear" @click="store.clearSearchHistory()">Clear history</button>
        </div>
      </template>
      <div v-else class="empty">No searches yet — queries with search text or an endpoint appear here.</div>
    </div>
  </div>
</template>

<style scoped>
.search-history {
  position: relative;
  display: inline-block;
}

.trigger {
  border: 0;
  background: none;
  color: #00729c;
  cursor: pointer;
  font-size: 0.875em;
  padding: 0.1rem 0.25rem;
}

.trigger:hover {
  text-decoration: underline;
}

.pop {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 200;
  width: min(420px, 92vw);
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  padding: 0.4rem;
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

.entry:hover {
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

.empty {
  color: #777;
  font-size: 0.82rem;
  padding: 0.5rem;
}
</style>
