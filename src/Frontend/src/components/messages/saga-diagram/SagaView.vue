<script setup lang="ts">
const props = defineProps<{
  message_id: string;
}>();
//http://localhost:33333/api/messages/search/4807d6c6-fc45-4385-a448-b2a201322a8c
</script>

<template>
  <div>
    <span aria-label="message-not-involved-in-saga">No Saga Data Available</span>
  </div>
  <div>
    <span aria-label="no-saga-plugin">To visualize your saga, please install the appropriate nuget package in your endpoint. Saga audit plugin needed to visualize saga</span>
  </div>
  <div>Message Id :{{ props.message_id }}</div>
</template>

<style scoped></style>
