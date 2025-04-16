<script setup lang="ts">
import VueDatePicker from "@vuepic/vue-datepicker";
import { ref, watch } from "vue";

const model = defineModel<Date[]>({ required: true });
const internalModel = ref<Date[]>([]);
const displayDataRange = ref<string>("No dates");

watch(internalModel, () => {
  model.value = internalModel.value;
  if (internalModel.value.length === 2) {
    const from = internalModel.value[0];
    const to = internalModel.value[1];
    displayDataRange.value = `${from.toLocaleDateString()} ${from.toLocaleTimeString()} - ${to.toLocaleDateString()} ${to.toLocaleTimeString()}`;
  }
});
</script>

<template>
  <div class="date-picker-range">
    <label>Dates:</label>
    <VueDatePicker v-model="internalModel" :range="{ partialRange: false }" :enable-seconds="true" :max-date="new Date()">
      <template #trigger>
        <a class="triggerLink">{{ displayDataRange }}</a>
      </template>
    </VueDatePicker>
  </div>
</template>

<style scoped>
.triggerLink {
  margin-left: 0.3em;
  cursor: pointer;
}
.date-picker-range {
  display: flex;
  align-items: center;
  margin-left: 1em;
}
</style>
