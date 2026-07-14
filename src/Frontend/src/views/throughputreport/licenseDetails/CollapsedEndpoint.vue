<script setup lang="ts">
import { computed } from "vue";
import { EndpointClassification, type Endpoint } from "./types";
import FAIcon from "@/components/FAIcon.vue";
import { faCircleChevronDown } from "@fortawesome/free-solid-svg-icons";

const props = defineProps<{ endpoint: Endpoint }>();
const emit = defineEmits(["expand"]);

const endpointClassificationStyle = computed(() => {
  switch (props.endpoint.classification) {
    case EndpointClassification.Full:
      return props.endpoint.isInBreach ? "--breach" : "--full";
    case EndpointClassification.SendOnly:
      return "--send-only";
  }
});
</script>

<template>
  <div class="endpoint-header" :style="{ '--endpoint-header-bg': `var(${endpointClassificationStyle})` }">
    <div class="endpoint-name">
      <FAIcon :icon="faCircleChevronDown" class="expand-button" size="lg" tabindex="0" title="expand" @click="emit('expand')" />
      <strong :title="endpoint.name">{{ endpoint.name }}</strong>
    </div>
    <div class="details">
      <span class="queues">Queues: {{ endpoint.queues.length }}</span>
      <span class="throughput">Throughput: {{ endpoint.totalMonthlyThroughput.toLocaleString() }}</span>
      <span class="c-size">Current Size: {{ endpoint.currentSize.name }}</span>
      <span class="l-size">Licensed Size: {{ endpoint.endpointSize.name }} </span>
    </div>
    <!-- <div>
      <RemoveEndpoint :endpoint="endpoint" />
    </div> -->
  </div>
</template>

<style scoped>
.endpoint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: hsl(from var(--endpoint-header-bg) h s 90%);
  border-radius: 5px;
}

.dark-mode .endpoint-header {
  background-color: var(--endpoint-header-bg);
}

.endpoint-header div {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.endpoint-header div.header-buttons {
  gap: 0.25rem;
}

.expand-button {
  cursor: pointer;
  color: hsl(from var(--bs-body-color) h s l / 50%);
}

.expand-button:hover {
  color: inherit;
}

.endpoint-header .details {
  font-size: 0.9em;
  gap: 1em;
  flex-basis: 60em;
}

.endpoint-header .details .queues {
  width: 7em;
}

.endpoint-header .details .l-size,
.endpoint-header .details .c-size {
  width: 10em;
}

.endpoint-header .details .throughput {
  width: 12em;
}

.endpoint-header .endpoint-name {
  flex-basis: calc(min(40em, 35vw));
  overflow: hidden;
}

.endpoint-header .endpoint-name strong {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
