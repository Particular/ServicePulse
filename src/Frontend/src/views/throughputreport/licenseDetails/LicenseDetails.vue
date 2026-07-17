<script setup lang="ts">
import routeLinks from "@/router/routeLinks";
import isRouteSelected from "@/composables/isRouteSelected";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import DataView from "@/components/DataView.vue";
import ColumnHeader from "@/components/ColumnHeader.vue";
import ExclamationMark from "@/components/ExclamationMark.vue";
import { faExternalLink, faWarning } from "@fortawesome/free-solid-svg-icons";
import { WarningLevel } from "@/components/WarningLevel";
import useIsLicenseDetailsSupported, { minimumSCVersionForLicenseDetails } from "./isLicenseDetailsSupported";
import ConditionalRender from "@/components/ConditionalRender.vue";
import NoMetadata from "./NoMetadata.vue";
import FAIcon from "@/components/FAIcon.vue";
import UploadMetadata from "./UploadMetadata.vue";

const isLicenseDetailsSupported = useIsLicenseDetailsSupported();

const licenseDetailsStore = useLicenseDetailsStore();
const { endpoints, endpointSizes, serviceEndDate, validId, hasLicenseDetails, error } = storeToRefs(licenseDetailsStore);

const sizes = computed(() =>
  endpoints.value.reduce(
    (result, endpoint) => {
      const { licensed, current } = result;
      const licensedCount = licensed.get(endpoint.endpointSize.name) ?? 0;
      const currentCount = current.get(endpoint.currentSize.name) ?? 0;
      licensed.set(endpoint.endpointSize.name, licensedCount + 1);
      current.set(endpoint.currentSize.name, currentCount + 1);
      return { licensed, current };
    },
    { licensed: new Map<string, number>(), current: new Map<string, number>() }
  )
);
const licensedCounts = computed(() => sizes.value.licensed);
const currentCounts = computed(() => sizes.value.current);
const allSizes = computed(() => [...new Set([...licensedCounts.value.keys(), ...currentCounts.value.keys()])].sort((a, b) => endpointSizes.value.findIndex((size) => size.name === a) - endpointSizes.value.findIndex((size) => size.name === b)));
</script>

<template>
  <ConditionalRender :supported="isLicenseDetailsSupported">
    <template #unsupported>
      <div class="not-supported">
        <p>
          The minimum version of ServiceControl required to enable this feature is
          <span> {{ minimumSCVersionForLicenseDetails }} </span>.
        </p>
        <div>
          <a class="btn btn-default btn-primary" href="https://particular.net/downloads" target="_blank">Update ServiceControl to latest version</a>
        </div>
      </div>
    </template>

    <ConditionalRender :supported="hasLicenseDetails">
      <template #unsupported>
        <NoMetadata :metadataError="error" />
      </template>
      <template v-if="!validId">
        <div class="id-warning alert alert-danger">
          <span>The stored endpoint metadata file does not match the current license. Please download a new version from the Particular customer portal</span>
          <button class="btn btn-primary">Customer Portal <FAIcon :icon="faExternalLink" /></button>
        </div>
        <UploadMetadata />
      </template>
      <div class="license-details box">
        <div class="inline-info">
          <h4>License Expiry Date</h4>
          <span>{{ serviceEndDate?.toLocaleDateString() }}</span>
        </div>
        <h3>Licensed Endpoints</h3>
        <div class="licensed-endpoints col-6">
          <div role="row" aria-label="column-headers" class="row table-head-row" :style="{ borderTop: 0 }">
            <ColumnHeader name="Size" label="Size (Average Messages/Month)" class="col-8" />
            <ColumnHeader name="Licensed" label="Licensed" class="col-2" />
            <ColumnHeader name="Used" label="Used" class="col-2" />
          </div>
          <DataView :data="allSizes">
            <template #data="{ pageData }">
              <div role="rowgroup" aria-label="endpoints">
                <div role="row" class="row grid-row" v-for="size in pageData" :key="size">
                  <span class="col-8" :title="endpointSizes.find((eps) => eps.name === size)?.throughputText">
                    {{ size }}
                  </span>
                  <span class="col-2">
                    {{ (licensedCounts.get(size) ?? 0).toLocaleString() }}
                  </span>
                  <span class="col-2 current-size">
                    {{ (currentCounts.get(size) ?? 0).toLocaleString() }}
                    <ExclamationMark v-if="(licensedCounts.get(size) ?? 0) !== (currentCounts.get(size) ?? 0)" :icon="faWarning" :type="WarningLevel.Warning" />
                  </span>
                </div>
              </div>
            </template>
          </DataView>
        </div>
      </div>
      <div>
        <div class="row mt-3">
          <div class="col-sm-12">
            <div class="nav tabs">
              <h5 class="nav-item" :class="{ active: isRouteSelected(routeLinks.throughput.licenseDetails.licensedEndpoints.link) }">
                <RouterLink :to="routeLinks.throughput.licenseDetails.licensedEndpoints.link">Licensed Endpoints</RouterLink>
              </h5>
              <h5 class="nav-item" role="tab" :class="{ active: isRouteSelected(routeLinks.throughput.licenseDetails.infrastructureQueues.link) }">
                <RouterLink :to="routeLinks.throughput.licenseDetails.infrastructureQueues.link">Infrastructure Queues</RouterLink>
              </h5>
              <h5 class="nav-item" :class="{ active: isRouteSelected(routeLinks.throughput.licenseDetails.excludedQueues.link) }">
                <RouterLink :to="routeLinks.throughput.licenseDetails.excludedQueues.link">Excluded Queues</RouterLink>
              </h5>
            </div>
          </div>
        </div>
        <RouterView />
      </div>
    </ConditionalRender>
  </ConditionalRender>
</template>

<style scoped>
.table-head-row {
  font-weight: bold;
}

.licensed-endpoints .grid-row {
  border-top: 1px solid #eee;
  border-right: 1px solid #fff;
  border-bottom: 1px solid #eee;
  border-left: 1px solid #fff;
  background-color: #fff;
}

.current-size {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.license-details > div {
  margin-bottom: 0.5rem;
}

.inline-info {
  display: flex;
  gap: 1em;
  align-items: center;
}

.inline-info * {
  margin: 0;
}

.inline-info h3::after {
  content: ":";
}

.id-warning {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.id-warning button {
  flex: 0;
  white-space: nowrap;
}
</style>
