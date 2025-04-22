<script setup lang="ts">
import { SagaMessageDataItem } from "@/stores/SagaDiagramStore";

defineProps<{
  messageData: SagaMessageDataItem[];
}>();
</script>

<template>
  <div v-if="messageData.length === 0" class="message-data-box">
    <span class="message-data-box-text--empty">Empty</span>
  </div>
  <div v-else v-for="(item, index) in messageData" :key="index" class="message-data-box">
    <b class="message-data-box-text">{{ item.key }}</b>
    <span class="message-data-box-text">=</span>
    <span class="message-data-box-text--ellipsis" :title="item.value">{{ item.value }}</span>
  </div>
</template>

<style scoped>
.message-data-box {
  display: flex;
}

.message-data-box-text {
  display: inline-block;
  margin-right: 0.25rem;
}

.message-data-box-text--ellipsis {
  display: inline-block;
  overflow: hidden;
  max-width: 100%;
  padding: 0%;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.message-data-box-text--empty {
  display: inline-block;
  width: 100%;
  text-align: center;
}
</style>
