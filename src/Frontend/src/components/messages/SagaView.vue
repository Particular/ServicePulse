<script setup lang="ts">
import Message from "@/resources/Message";
import { SagaHistory } from "@/resources/SagaHistory";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    message: Message;
    sagaHistory?: SagaHistory;
  }>(),
  { sagaHistory: undefined }
);

const participatedInSaga = computed(() => (props.message?.invoked_sagas ?? []).length > 0);
const hasSagaData = computed(() => (props.sagaHistory?.changes?.length ?? 0) > 0);
const showNoPluginActiveLeged = computed(() => participatedInSaga.value === true && hasSagaData.value === false);
</script>

<template>
  <div v-if="participatedInSaga == false">
    <span role="status" aria-label="message-not-involved-in-saga">No Saga Data Available</span>
  </div>
  <div v-if="showNoPluginActiveLeged">
    <span role="status" aria-label="saga-plugin-needed">To visualize your saga, please install the appropriate nuget package in your endpoint. Saga audit plugin needed to visualize saga</span>
  </div>
  <div v-if="hasSagaData" role="list" aria-label="saga-sequence-list"></div>
</template>

<style scoped></style>
