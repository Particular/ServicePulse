<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import ListFilterSelector from "@/components/audit/ListFilterSelector.vue";
import ActionButton from "@/components/ActionButton.vue";
import AutoRefreshIndicator from "@/components/AutoRefreshIndicator.vue";
import { faRefresh, faXmark } from "@fortawesome/free-solid-svg-icons";

const props = defineProps<{ queryInProgress: boolean; queryStartedAt?: number | null; nextRefreshAt?: number | null }>();
const model = defineModel<number | null>({ required: true });
const emit = defineEmits<{ (e: "manualRefresh"): Promise<void>; (e: "cancelQuery"): void }>();
const autoRefreshOptionsText: [number, string][] = [
  [0, "Off"],
  [5000, "Every 5 seconds"],
  [15000, "Every 15 seconds"],
  [30000, "Every 30 seconds"],
  [60000, "Every 1 minute"],
  [600000, "Every 10 minute"],
  [1800000, "Every 30 minute"],
  [3600000, "Every 1 hour"],
];

function extracted() {
  const item = autoRefreshOptionsText.find((item) => item[0] === model.value);

  if (item) {
    return item[1];
  }

  return "Off";
}

const selectValue = extracted();

const selectedRefresh = ref<string>(selectValue);

watch(selectedRefresh, (newValue) => {
  const item = autoRefreshOptionsText.find((item) => item[1] === newValue);

  if (item) {
    if (item[0] === 0) {
      model.value = null;
    } else {
      model.value = item[0];
    }
  }
});
/* elapsed timer while a query runs */
const now = ref(Date.now());
let ticker: number | undefined;
watch(
  () => props.queryInProgress,
  (running) => {
    window.clearInterval(ticker);
    if (running) {
      now.value = Date.now();
      ticker = window.setInterval(() => (now.value = Date.now()), 100);
    }
  },
  { immediate: true }
);
onBeforeUnmount(() => window.clearInterval(ticker));

const elapsedLabel = computed(() => {
  if (!props.queryInProgress || !props.queryStartedAt) return null;
  return `${Math.max(0, (now.value - props.queryStartedAt) / 1000).toFixed(1)}s`;
});

// While auto-refresh is armed and no query runs, the countdown ring takes the
// place of the refresh arrow inside the button
const ringActive = computed(() => !props.queryInProgress && props.nextRefreshAt != null && model.value != null);

async function refreshOrCancel() {
  if (props.queryInProgress) {
    emit("cancelQuery");
    return;
  }
  await emit("manualRefresh");
}
</script>

<template>
  <div class="refresh-config">
    <ActionButton size="sm" :icon="props.queryInProgress ? faXmark : ringActive ? undefined : faRefresh" :loading="props.queryInProgress" :disable-on-loading="false" @click="refreshOrCancel">
      <template v-if="ringActive && !props.queryInProgress" #icon>
        <AutoRefreshIndicator class="ring" :next-refresh-at="props.nextRefreshAt ?? null" :interval-ms="model" :refreshing="false" />
      </template>
      <template v-if="props.queryInProgress"
        >Cancel<template v-if="elapsedLabel"> · {{ elapsedLabel }}</template></template
      >
      <template v-else>Refresh</template>
    </ActionButton>
    <div class="filter">
      <div class="filter-label">Auto-Refresh:</div>
      <div class="filter-component">
        <ListFilterSelector :items="autoRefreshOptionsText.map((i) => i[1])" v-model="selectedRefresh" item-name="result" :can-clear="false" :show-clear="false" :show-filter="false" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.refresh-config {
  display: flex;
  align-items: center;
  gap: 1em;
}

.filter {
  display: flex;
  align-items: center;
}

.filter-label {
  font-weight: bold;
}

.ring {
  /* the icon slot is a flex child; only the FA icon's own margin needs matching */
  margin-right: 0.25rem;
}
</style>
