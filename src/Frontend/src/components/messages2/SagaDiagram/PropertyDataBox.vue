<script setup lang="ts">
import { SagaMessageDataItem, useSagaDiagramStore } from "@/stores/SagaDiagramStore";
import { storeToRefs } from "pinia";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

defineProps<{
  messageData: SagaMessageDataItem[];
}>();

const sagaDiagramStore = useSagaDiagramStore();
const { messageDataLoading } = storeToRefs(sagaDiagramStore);
</script>

<template>
  <div v-if="messageDataLoading" class="message-data-loading">
    <LoadingSpinner />
  </div>

  <div v-else-if="messageData.length > 0" class="saga-properties-list">
    <li v-for="(item, index) in messageData" :key="index" class="saga-properties-list-item">
      <span class="saga-properties-list-text" :title="item.key">{{ item.key }}</span>
      <span class="saga-properties-list-text">=</span>
      <span class="saga-properties-list-text" :title="item.value">{{ item.value }}</span>
    </li>
  </div>
</template>

<style scoped>
.message-data-loading {
  display: flex;
  justify-content: center;
  align-items: center;
}

.saga-properties-list {
  margin: 0;
  padding-left: 0.25rem;
  list-style: none;
}

.saga-properties-list-item {
  display: flex;
}

.saga-properties-list-text {
  display: inline-block;
  padding-top: 0.25rem;
  padding-right: 0.75rem;
  overflow: hidden;
  font-size: 0.75rem;
  white-space: nowrap;
}

.saga-properties-list-text:first-child {
  min-width: 8rem;
  max-width: 8rem;
  display: inline-block;
  text-overflow: ellipsis;
}

.saga-properties-list-text:last-child {
  padding-right: 0;
  text-overflow: ellipsis;
}
</style>
