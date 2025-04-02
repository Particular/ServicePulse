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
import Handlers, { HandlerLocation } from "./SequenceDiagram/HandlersComponent.vue";
import Routes from "./SequenceDiagram/RoutesComponent.vue";

const endpoints = ref<Endpoint[]>([]);
const handlers = ref<Handler[]>([]);
const routes = ref<MessageProcessingRoute[]>([]);
const endpointCentrePoints = ref<EndpointCentrePoint[]>([]);
const maxWidth = ref(150);
const maxHeight = ref(150);
const handlerLocations = ref<HandlerLocation[]>([]);

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
function setMaxWidth(width: number) {
  maxWidth.value = width;
}
function setMaxHeight(height: number) {
  maxHeight.value = height;
}
function setHandlerLocations(locations: HandlerLocation[]) {
  handlerLocations.value = locations;
}
</script>

<template>
  <div class="outer">
    <svg class="sequence-diagram" :width="`max(100%, ${isNaN(maxWidth) ? 0 : maxWidth}px)`" :height="maxHeight + 20">
      <Endpoints :endpoints="endpoints" @centre-points="setTimelines" @max-width="setMaxWidth" />
      <Timeline :centre-points="endpointCentrePoints" :height="maxHeight" />
      <Handlers :handlers="handlers" :endpoint-centre-points="endpointCentrePoints" @max-height="setMaxHeight" @handler-locations="setHandlerLocations" />
      <Routes :routes="routes" :handler-locations="handlerLocations" />
    </svg>
  </div>
</template>

<style scoped>
.outer {
  max-width: 100%;
  max-height: calc(100vh - 27em);
  overflow: auto;
}

.sequence-diagram {
  --error: red;
  --gray20: #333333;
  --gray30: #444444;
  --gray40: #666666;
  --gray60: #999999;
  --gray80: #cccccc;
  --gray90: #e6e6e6;
  --gray95: #b3b3b3;
  --highlight: #0b6eef;
  --highlight-background: #c5dee9;
  background: white;
}
</style>
