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
  <VueDatePicker v-model="internalModel" :range="{ partialRange: false }" :enable-seconds="true" :max-date="new Date()">
    <template #trigger>
      <button type="button" class="btn btn-dropdown dropdown-toggle">
        {{ displayDataRange }}
      </button>
    </template>
  </VueDatePicker>
</template>
