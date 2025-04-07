<script setup lang="ts">
import { Endpoint } from "@/resources/SequenceDiagram/Endpoint";

defineProps<{ endpoint: Endpoint }>();
</script>

<template>
  <div class="endpoint-tooltip">
    <div class="tooltip-row">
      <label>Name:</label>
      <span>{{ endpoint.name }}</span>
    </div>
    <div class="tooltip-row">
      <label>NSB Version:</label>
      <span>{{ endpoint.version }}</span>
    </div>
    <div class="tooltip-row">
      <label>Host:</label>
      <span>{{ endpoint.host }}</span>
    </div>
  </div>
</template>

<style>
.endpoint-tooltip {
  display: flex;
  flex-direction: column;
}

.tooltip-row {
  display: flex;
  gap: 0.5em;
}

.tooltip-row label {
  align-self: flex-end;
  font-weight: bold;
  color: #b3b3b3;
}
</style>
