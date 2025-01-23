<script setup lang="ts">
import { useConfiguration } from "@/composables/configuration";
import moment from "moment";

const configuration = useConfiguration();
// "Wed, Jan 15th 2025 10:56:21 +10:00",
function formatDate(date: string) {
  return moment(date).local().format("LLLL"); //.format("ddd, MMM Do YYYY HH:mm:ss Z");
}
</script>

<template>
  <div class="box" v-if="configuration?.mass_transit_connector !== undefined">
    <div class="row margin-bottom-10">
      <h4>
        Connector Version: <span class="version-format">{{ configuration.mass_transit_connector.version }}</span>
      </h4>
    </div>
    <div class="row margin-bottom-10">
      <h4>List of error queues configured in the connector.</h4>
      <div class="queues-container">
        <div class="row margin-gap hover-highlight" v-for="queue in configuration.mass_transit_connector.error_queues" :key="queue.name">
          <div class="col-sm-6">{{ queue.name }}</div>
          <div class="col-sm-6 error-color" v-if="!queue.ingesting">Not ingesting</div>
          <div class="col-sm-6 ok-color" v-else>Ok</div>
        </div>
      </div>
    </div>
    <div class="row">
      <h4>The entries below are the most recent warning and error-level events recorded on the ServiceControl Connector.</h4>
      <div class="logs-container">
        <div class="row margin-gap hover-highlight" v-for="log in configuration.mass_transit_connector.logs" :key="log.date">
          <div class="col-2">{{ formatDate(log.date) }}</div>
          <div class="col-1" :class="`${log.level.toLowerCase()}-color`">{{ log.level }}</div>
          <div class="col-9" :class="`${log.level.toLowerCase()}-color`">
            <span>{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="box" v-else>
    <p>MassTransit Connector for ServiceControl is not configured.</p>
    <p><a target="_blank" href="https://particular.net/learn-more-about-masstransit-connector">Learn more about the MassTransit Connector.</a></p>
  </div>
</template>

<style scoped>
.hover-highlight:hover {
  background-color: #ededed;
}

.margin-gap {
  margin-bottom: 3px;
}
.queues-container {
  max-width: 30em;
  padding: 0.75rem;
}
.logs-container {
  padding: 0.75rem;
}
.version-format {
  font-weight: bold;
}
.box > .row:not(:last-child) {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ccc;
  margin-bottom: 0.5rem;
}
.warning-color {
  color: var(--bs-warning);
}
.error-color {
  color: var(--bs-danger);
}
.ok-color {
  color: var(--bs-success);
}
</style>
