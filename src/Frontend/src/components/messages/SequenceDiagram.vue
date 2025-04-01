<script setup lang="ts">
import { useFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import Message from "@/resources/Message";
import { Endpoint } from "@/resources/SequenceDiagram/Endpoint";
import { Handler } from "@/resources/SequenceDiagram/Handler";
import { MessageProcessingRoute } from "@/resources/SequenceDiagram/RoutedMessage";
import { ModelCreator } from "@/resources/SequenceDiagram/SequenceModel";
import { ref } from "vue";
import Endpoints from "./SequenceDiagram/EndpointsComponent.vue";

const endpoints = ref<Endpoint[]>([]);
const handlers = ref<Handler[]>([]);
const routes = ref<MessageProcessingRoute[]>([]);

async function fetchConversation() {
  const response = await useFetchFromServiceControl(`conversations/${"b4dac7d7-4571-4f26-aa32-b29c0030c95f"}`); //${"9d91504c-d8b7-488c-b525-b2a300109653"}`);
  if (response.status === 404) {
    return;
  }

  const model = new ModelCreator((await response.json()) as Message[]);
  endpoints.value = model.endpoints;
  handlers.value = model.handlers;
  routes.value = model.routes;
}

fetchConversation();
</script>

<template>
  <svg class="sequence-diagram" width="100%" height="100%">
    <Endpoints :endpoints="endpoints" />
  </svg>
</template>

<style scoped>
.sequence-diagram {
  --error: red;
  --gray20: #333333;
  --gray30: #444444;
  --gray40: #666666;
  --gray60: #999999;
  --gray80: #cccccc;
  --gray90: #e6e6e6;
  --gray95: #b3b3b3;
  background: white;
}
</style>
