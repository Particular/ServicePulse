<script setup lang="ts">
import VueDatePicker from "@vuepic/vue-datepicker";
import { ref, useTemplateRef, watch } from "vue";

type DateRange = [Date, Date];

const model = defineModel<Date[]>({ required: true });
const internalModel = ref<Date[]>([]);
const displayDataRange = ref<string>("No dates");
const datePicker = useTemplateRef<typeof VueDatePicker>("datePicker");

watch(internalModel, () => {
  if (isValidRange(internalModel.value as DateRange)) {
    model.value = internalModel.value;
    displayDataRange.value = formatDate(internalModel.value as DateRange);
  } else internalModel.value = model.value;
});

watch(model, () => {
  internalModel.value = model.value;
});

function isValidRange([fromDate, toDate]: DateRange) {
  return (!fromDate && !toDate) || (toDate && toDate <= new Date());
}

function clearCurrentDate() {
  internalModel.value = [];
  datePicker.value?.closeMenu();
}

function formatDate([fromDate, toDate]: DateRange) {
  if (toDate && toDate > new Date()) return "Date cannot be in the future";
  if (fromDate && toDate) return `${fromDate.toLocaleString()} - ${toDate.toLocaleString()}`;
  if (fromDate) return fromDate.toLocaleString();
  return "No dates";
}
</script>

<template>
  <VueDatePicker ref="datePicker" v-model="internalModel" :format="formatDate" :range="{ partialRange: false }" :enable-seconds="true" :action-row="{ showNow: false, showCancel: false, showSelect: true }">
    <template #trigger>
      <button type="button" class="btn btn-dropdown dropdown-toggle">
        {{ displayDataRange }}
      </button>
    </template>
    <template #action-extra>
      <button v-if="internalModel.length === 2" class="dp__action_button dp__action_cancel" @click="clearCurrentDate()">Clear Range</button>
    </template>
  </VueDatePicker>
</template>
