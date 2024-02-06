<script setup>
import { ref, computed } from "vue";
import { useMonitoringStore } from "../../stores/MonitoringStore";

const props = defineProps({
  unit: String,
  isActive: Boolean,
  sortBy: {
    type: String,
    required: true,
    validator: (value) => ["name", "queueLength", "throughput", "retries", "processingTime", "criticalTime"].includes(value),
  },
});

const monitoringStore = useMonitoringStore();
const isActive = computed(() => props.isActive);
const sortBy = computed(() => props.sortBy);
const isAscending = ref(false);
const sortIcon = ref("sort-down");

function toggleSort() {
  isAscending.value = isActive.value ? !isAscending.value : false;
  sortIcon.value = isAscending.value ? "sort-up" : "sort-down";

  monitoringStore.updateSort(sortBy.value, isAscending.value);
}
</script>
<template>
  <div class="box-header">
    <button @click="toggleSort" class="column-header-button">
      <span>
        <slot></slot>
        <span class="table-header-unit"><slot name="unit"></slot></span>
      </span>
      <div>
        <i v-if="isActive" :class="sortIcon"></i>
      </div>
    </button>
  </div>
</template>

<style scoped>
.column-header-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.column-header-button span {
  text-transform: uppercase;
}

.column-header-button:hover span {
  text-decoration: underline;
}

.column-header-button div {
  display: inline-block;
}

.sort-up,
.sort-down {
  background-position: center;
  background-repeat: no-repeat;
  width: 8px;
  height: 14px;
  display: inline-block;
  padding: 0;
  margin-left: 10px;
  vertical-align: middle;
}

.sort-up {
  background-image: url("../../assets/sort-up.svg");
}

.sort-down {
  background: url("../../assets/sort-down.svg");
}
</style>
