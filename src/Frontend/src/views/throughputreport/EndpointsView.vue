<script setup lang="ts">
import routeLinks from "@/router/routeLinks";
import isRouteSelected from "@/composables/isRouteSelected";
import { UserIndicator } from "@/views/throughputreport/queues/userIndicator.ts";
import { userIndicatorMapper } from "@/views/throughputreport/queues/userIndicatorMapper.ts";
import { ref, type Component } from "vue";
import { storeToRefs } from "pinia";
import LegendNServiceBusEndpoint from "./LegendNServiceBusEndpoint.vue";
import LegendNServiceBusEndpointNoLongerInUse from "./LegendNServiceBusEndpointNoLongerInUse.vue";
import LegendTransactionalSessionProcessorEndpoint from "./LegendTransactionalSessionProcessorEndpoint.vue";
import LegendSendOnlyEndpoint from "./LegendSendOnlyEndpoint.vue";
import LegendPlannedToDecommission from "./LegendPlannedToDecommission.vue";
import LegendNotNServiceBusEndpoint from "./LegendNotNServiceBusEndpoint.vue";
import LegendGatewayOrBridgeEndpoint from "./LegendGatewayOrBridgeEndpoint.vue";
import LegendParticularPlatformEndpoint from "./LegendParticularPlatformEndpoint.vue";
import useThroughputStoreAutoRefresh from "@/composables/useThroughputStoreAutoRefresh";
import ExclamationMark from "@/components/ExclamationMark.vue";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore.ts";
import { WarningLevel } from "@/components/WarningLevel.ts";
import useIsLicenseDetailsSupported from "./licenseDetails/isLicenseDetailsSupported.ts";

const { store } = useThroughputStoreAutoRefresh();
const { isBrokerTransport } = storeToRefs(store);
const licenseDetailsStore = useLicenseDetailsStore();
const { endpoints } = storeToRefs(licenseDetailsStore);
const isLicenseDetailsSupported = useIsLicenseDetailsSupported();

const showLegend = ref(false);

const legendOptions = new Map<UserIndicator, Component>([
  [UserIndicator.NServiceBusEndpoint, LegendNServiceBusEndpoint],
  [UserIndicator.NServiceBusEndpointNoLongerInUse, LegendNServiceBusEndpointNoLongerInUse],
  [UserIndicator.TransactionalSessionProcessorEndpoint, LegendTransactionalSessionProcessorEndpoint],
  [UserIndicator.SendOnlyEndpoint, LegendSendOnlyEndpoint],
  [UserIndicator.PlannedToDecommission, LegendPlannedToDecommission],
  [UserIndicator.NotNServiceBusEndpoint, LegendNotNServiceBusEndpoint],
  [UserIndicator.GatewayOrBridgingEndpoint, LegendGatewayOrBridgeEndpoint],
  [UserIndicator.ParticularPlatformEndpoint, LegendParticularPlatformEndpoint],
]);

function toggleOptionsLegendVisible() {
  showLegend.value = !showLegend.value;
}
</script>

<template>
  <div class="row">
    <div class="col-sm-12">
      <div class="nav tabs">
        <h5 class="nav-item" :class="{ active: isRouteSelected(routeLinks.throughput.queues.detectedEndpoints.link) }">
          <RouterLink :to="routeLinks.throughput.queues.detectedEndpoints.link">Detected Endpoint Queues</RouterLink>
        </h5>
        <h5 v-if="isBrokerTransport" class="nav-item" role="tab" :class="{ active: isRouteSelected(routeLinks.throughput.queues.detectedBrokerQueues.link) }">
          <RouterLink :to="routeLinks.throughput.queues.detectedBrokerQueues.link">Detected Broker Queues</RouterLink>
        </h5>
        <h5 class="nav-item" v-if="isLicenseDetailsSupported" :class="{ active: isRouteSelected(routeLinks.throughput.licenseDetails.root) }">
          <RouterLink :to="routeLinks.throughput.licenseDetails.licensedEndpoints.link">
            <span>License Details</span>
            <ExclamationMark v-if="endpoints.some((endpoint) => endpoint.isInBreach)" :type="WarningLevel.Warning" />
          </RouterLink>
        </h5>
      </div>
    </div>
  </div>
  <div class="box" v-if="isRouteSelected(routeLinks.throughput.queues.root)">
    <div class="row mt-2">
      <p>
        Set an Endpoint Type for all detected endpoint and broker queues with the most appropriate option.<br />
        Use the filters to bulk set the Endpoint Types on similar named endpoints/queues.<br />
        If the names of the endpoints/queues contain confidential or proprietary information, make sure you set up <RouterLink :to="routeLinks.throughput.setup.mask.link">masking in Configuration</RouterLink>.<br />
        <a href="#" :aria-label="`${showLegend ? 'Hide' : 'Show'} Endpoint Types meaning`" @click.prevent="toggleOptionsLegendVisible()">{{ showLegend ? "Hide" : "Show" }} Endpoint Types meaning.</a>
      </p>
      <div v-show="showLegend" class="alert alert-info">
        <div v-for="[key, LegendComponent] in legendOptions" :key="key">
          <strong>{{ userIndicatorMapper.get(key) }}</strong> - <component :is="LegendComponent" />.
        </div>
        <p class="mt-2">
          <small><a href="https://particular.net/usage-user-indicators" target="_blank">See documentation for more details about endpoint type indicators</a>.</small>
        </p>
      </div>
    </div>
    <RouterView />
  </div>
  <RouterView v-else />
</template>

<style scoped></style>
