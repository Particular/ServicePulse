<script setup lang="ts">
import { useConfiguration } from "@/composables/configuration";
import moment from "moment";

const configuration = useConfiguration();
// "Wed, Jan 15th 2025 10:56:21 +10:00",
function formatDate(date: string) {
  return moment(date).format("ddd, MMM Do YYYY HH:mm:ss Z");
}
</script>

<template>
  <div class="box" v-if="configuration?.mass_transit_connector !== undefined">
    <div class="row margin-bottom-10">
      <div class="heading">
        Connector Version: <span class="version-format">{{ configuration.mass_transit_connector.version }}</span>
      </div>
    </div>
    <div class="row margin-bottom-10">
      <div class="heading">List of error queues configured in the connector.</div>
      <div class="queues-container">
        <div class="row margin-gap hover-highlight" v-for="queue in configuration.mass_transit_connector.error_queues" :key="queue.name">
          <div class="col-sm-6">{{ queue.name }}</div>
          <div class="col-sm-6 error-color" v-if="!queue.ingesting">Not ingesting</div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="heading">The entries below are the most recent warning and error-level events recorded on the ServiceControl Connector.</div>
      <div class="logs-container">
        <div class="row margin-gap hover-highlight" v-for="log in configuration.mass_transit_connector.logs" :key="log.date">
          <div class="col-2">{{ formatDate(log.date) }}</div>
          <div class="col-1" :class="`${log.level.toLowerCase()}-color`">{{ log.level }}</div>
          <div class="col-9" :class="`${log.level.toLowerCase()}-color`">
            <pre class="reset-style">{{ log.message }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="box" v-else>
    <p>MassTransit Connector for ServiceControl is not configured.</p>
    <p>Learn more about the Connector url.</p>
  </div>
</template>

<style scoped>
.hover-highlight:hover {
  background-color: #ededed;
}
.heading {
  font-size: 16px;
}
.reset-style {
  all: revert;
  margin: 0;
}
.margin-gap {
  margin-bottom: 3px;
}
.queues-container {
  max-width: 400px;
  padding: 10px;
}
.logs-container {
  padding: 10px;
}
.version-format {
  font-weight: bold;
}
.margin-bottom-10 {
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
}
.warning-color {
  color: #ff9800;
}
.error-color {
  color: #f44336;
}
</style>
