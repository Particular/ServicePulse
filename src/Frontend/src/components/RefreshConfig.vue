<script setup lang="ts">
import { ref, watch } from "vue";
import ListFilterSelector from "@/components/audit/ListFilterSelector.vue";

const props = defineProps<{ isLoading: boolean }>();
const model = defineModel<number | null>({ required: true });
const emit = defineEmits<{ (e: "manualRefresh"): Promise<void> }>();
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
const showSpinning = ref(false);
watch(
  () => props.isLoading,
  (newValue) => {
    if (newValue) {
      showSpinning.value = true;
      window.setTimeout(() => {
        showSpinning.value = false;
      }, 1000);
    }
  }
);
async function refresh() {
  await emit("manualRefresh");
}
</script>

<template>
  <div class="refresh-config">
    <button class="btn btn-sm" title="refresh" @click="refresh"><i class="fa fa-refresh" :class="{ spinning: showSpinning }" /> Refresh List</button>
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
  margin-bottom: 0.5em;
}

.filter {
  display: flex;
  align-items: center;
}

.filter-label {
  font-weight: bold;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fa-refresh {
  display: inline-block;
}

/* You can add this class dynamically when needed */
.fa-refresh.spinning {
  animation: spin 1s linear infinite;
}
</style>
