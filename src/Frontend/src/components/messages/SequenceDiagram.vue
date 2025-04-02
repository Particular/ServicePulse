<script setup lang="ts">
import { useFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import Message from "@/resources/Message";
import { Endpoint } from "@/resources/SequenceDiagram/Endpoint";
import { Handler } from "@/resources/SequenceDiagram/Handler";
import { MessageProcessingRoute } from "@/resources/SequenceDiagram/RoutedMessage";
import { ModelCreator } from "@/resources/SequenceDiagram/SequenceModel";
import { ref } from "vue";
import Endpoints, { EndpointCentrePoint } from "./SequenceDiagram/EndpointsComponent.vue";
import Timeline from "./SequenceDiagram/TimelineComponent.vue";
import Handlers from "./SequenceDiagram/HandlersComponent.vue";

const endpoints = ref<Endpoint[]>([]);
const handlers = ref<Handler[]>([]);
const routes = ref<MessageProcessingRoute[]>([]);
const endpointCentrePoints = ref<EndpointCentrePoint[]>([]);
const maxHeight = ref(150);

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

function setTimelines(centrePoints: EndpointCentrePoint[]) {
  endpointCentrePoints.value = centrePoints;
}
function setMaxHeight(height: number) {
  maxHeight.value = height;
}
</script>

<template>
  <svg class="sequence-diagram" width="100%" :height="maxHeight + 20">
    <Endpoints :endpoints="endpoints" v-on:centre-points="setTimelines" />
    <Timeline :centre-points="endpointCentrePoints" :height="maxHeight" />
    <Handlers :handlers="handlers" :endpoint-centre-points="endpointCentrePoints" v-on:max-height="setMaxHeight" />
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
