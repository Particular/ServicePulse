<script setup lang="ts">
import { Handler } from "@/components/messages2/SequenceDiagram/Handler";

defineProps<{ handler: Handler }>();
</script>

<template>
  <div v-if="handler.id === 'First'">Start of Conversation</div>
  <div v-else class="handler-tooltip">
    <div class="title">Processing of Message</div>
    <div class="details">
      <label>Processing Time:</label>
      <span>{{ handler.processingTime }}</span>
      <label>Processing Of:</label>
      <span>{{ handler.friendlyName }}</span>
      <label v-if="handler.partOfSaga">Sagas Invoked:</label>
      <span v-if="handler.partOfSaga">{{ handler.partOfSaga }}</span>
    </div>
  </div>
</template>

<style>
.handler-tooltip {
  display: flex;
  flex-direction: column;
}

.handler-tooltip .title {
  font-weight: bold;
}

.handler-tooltip .details {
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 0.5em;
}

.handler-tooltip label {
  grid-column: 1;
  justify-self: end;
  font-weight: bold;
  color: #b3b3b3;
}

.handler-tooltip span {
  word-break: break-all;
}
</style>
