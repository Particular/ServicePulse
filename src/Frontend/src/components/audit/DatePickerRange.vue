<script setup lang="ts">
import VueDatePicker from "@vuepic/vue-datepicker";
import { ref, useTemplateRef, watch } from "vue";

const model = defineModel<Date[]>({ required: true });
const internalModel = ref<Date[]>([]);
const displayDataRange = ref<string>("No dates");
const datePicker = useTemplateRef<typeof VueDatePicker>("datePicker");

watch(internalModel, () => {
  model.value = internalModel.value;
  if (internalModel.value.length === 2) {
    const from = internalModel.value[0];
    const to = internalModel.value[1];
    displayDataRange.value = `${from.toLocaleDateString()} ${from.toLocaleTimeString()} - ${to.toLocaleDateString()} ${to.toLocaleTimeString()}`;
  } else {
    displayDataRange.value = "No dates";
  }
});

function clearCurrentDate() {
  internalModel.value = [];
  datePicker.value?.closeMenu();
}
</script>

<template>
  <VueDatePicker ref="datePicker" v-model="internalModel" :range="{ partialRange: false }" :enable-seconds="true" :max-date="new Date()" :action-row="{ showNow: false, showCancel: false, showSelect: true }">
    <template #trigger>
      <button type="button" class="btn btn-dropdown dropdown-toggle">
        {{ displayDataRange }}
      </button>
    </template>
    <template #action-extra>
      <button v-if="internalModel.length === 2" class="dp__action_button dp__action_cancel" @click="clearCurrentDate()">Clear range</button>
    </template>
  </VueDatePicker>
</template>
