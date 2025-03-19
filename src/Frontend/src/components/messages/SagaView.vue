<script setup lang="ts">
import Message from "@/resources/Message";

defineProps<{
  message: Message;
}>();
//http://localhost:33333/api/messages/search/4807d6c6-fc45-4385-a448-b2a201322a8c
</script>

<template>
  <div>
    <span role="status" aria-label="message-not-involved-in-saga">No Saga Data Available</span>
  </div>
  <div>
    <span aria-label="no-saga-plugin">To visualize your saga, please install the appropriate nuget package in your endpoint. Saga audit plugin needed to visualize saga</span>
  </div>
  <div v-if="message && message.invoked_sagas && message.invoked_sagas.length > 0" role="list" aria-label="saga-sequence-list"></div>
</template>

<style scoped></style>
