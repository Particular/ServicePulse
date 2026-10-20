<script setup lang="ts">
import routeLinks from "@/router/routeLinks";
import isRouteSelected from "@/composables/isRouteSelected";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import DataView from "@/components/DataView.vue";
import ColumnHeader from "@/components/ColumnHeader.vue";
import ExclamationMark from "@/components/ExclamationMark.vue";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { WarningLevel } from "@/components/WarningLevel";
import useIsLicenseDetailsSupported, { minimumSCVersionForLicenseDetails } from "./isLicenseDetailsSupported";
import ConditionalRender from "@/components/ConditionalRender.vue";
import NoMetadata from "./NoMetadata.vue";
import UploadMetadata from "./UploadMetadata.vue";
import DetailsItem from "@/components/DetailsItem.vue";
import ExternalLink from "@/components/ExternalLink.vue";
import { EndpointClassification } from "@/resources/LicenseDetails.ts";
import ActionButton from "@/components/ActionButton.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const isLicenseDetailsSupported = useIsLicenseDetailsSupported();

const licenseDetailsStore = useLicenseDetailsStore();
const { endpoints, endpointSizes, serviceEndDate, validId, hasLicenseDetails, error, infrastructureQueues, excludedQueues, unassignedQueues, hasChanges, hasAmendments, saving } = storeToRefs(licenseDetailsStore);

const confirmReset = ref(false);

const sizes = computed(() =>
  endpoints.value
    .filter((endpoint) => endpoint.classification === EndpointClassification.Full)
    .reduce(
      (result, endpoint) => {
        const { licensed, current } = result;
        const licensedSizeName = endpoint.licensedSize?.name;
        const licensedCount = licensed.get(licensedSizeName ?? "") ?? 0;
        const currentCount = current.get(endpoint.currentSize.name) ?? 0;
        if (licensedSizeName != null) licensed.set(licensedSizeName, licensedCount + 1);
        current.set(endpoint.currentSize.name, currentCount + 1);
        return { licensed, current };
      },
      { licensed: new Map<string, number>(), current: new Map<string, number>() }
    )
);
const licensedCounts = computed(() => sizes.value.licensed);
const currentCounts = computed(() => sizes.value.current);
const allSizes = computed(() => [...new Set([...licensedCounts.value.keys(), ...currentCounts.value.keys()])].sort((a, b) => endpointSizes.value.findIndex((size) => size.name === a) - endpointSizes.value.findIndex((size) => size.name === b)));
const estimateUrlParams = computed(() => [...currentCounts.value.entries().map(([endpointSize, count]) => `${endpointSize}=${count}`)].join("&"));

async function removeAmendments() {
  confirmReset.value = false;
  await licenseDetailsStore.removeAmendments();
}
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
          <ExternalLink class="btn btn-default btn-primary" href="https://particular.net/downloads">Update ServiceControl to latest version</ExternalLink>
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
          <ExternalLink href="https://customers.particular.net" class="btn btn-primary" show-icon>Customer Portal</ExternalLink>
        </div>
        <UploadMetadata />
      </template>
      <div class="license-details box">
        <div class="details col-6">
          <DetailsItem label="License Expiry Date" class="license-expiry">
            {{ serviceEndDate?.toLocaleDateString() }}
          </DetailsItem>
          <h3>Licensed Endpoints</h3>
          <div class="licensed-endpoints">
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
        <div class="action-buttons">
          <ActionButton v-if="hasAmendments" variant="danger" @click="confirmReset = true" :disabled="saving">Remove Amendments</ActionButton>
          <!-- awaiting update to the pricing page to support this functionality -->
          <ExternalLink v-if="true" :href="`https://particular.net/pricing?${estimateUrlParams}`" class="btn btn-primary" show-icon>Estimate Renewal Price</ExternalLink>
        </div>
      </div>
      <div>
        <div class="row mt-3">
          <div class="col-sm-12 tab-row">
            <div class="nav tabs">
              <h5 class="nav-item" :class="{ active: isRouteSelected(routeLinks.throughput.licenseDetails.licensedEndpoints.link) }">
                <RouterLink :to="routeLinks.throughput.licenseDetails.licensedEndpoints.link">
                  <span>Licensed Endpoints</span>
                  <span class="badge">{{ endpoints.length }}</span>
                </RouterLink>
              </h5>
              <h5 class="nav-item" role="tab" :class="{ active: isRouteSelected(routeLinks.throughput.licenseDetails.infrastructureQueues.link) }">
                <RouterLink :to="routeLinks.throughput.licenseDetails.infrastructureQueues.link">
                  <span>Infrastructure Queues</span>
                  <span class="badge">{{ infrastructureQueues.length }}</span>
                </RouterLink>
              </h5>
              <h5 class="nav-item" :class="{ active: isRouteSelected(routeLinks.throughput.licenseDetails.excludedQueues.link) }">
                <RouterLink :to="routeLinks.throughput.licenseDetails.excludedQueues.link">
                  <span>Excluded Queues</span>
                  <span class="badge">{{ excludedQueues.length }}</span>
                </RouterLink>
              </h5>
              <h5 class="nav-item" :class="{ active: isRouteSelected(routeLinks.throughput.licenseDetails.unassignedQueues.link) }">
                <RouterLink :to="routeLinks.throughput.licenseDetails.unassignedQueues.link">
                  <span>Unassigned Queues</span>
                  <span class="badge">{{ unassignedQueues.length }}</span>
                </RouterLink>
              </h5>
            </div>
            <div class="action-buttons">
              <ActionButton variant="secondary" v-if="hasChanges" :disabled="saving" @click="licenseDetailsStore.discardChanges">Discard Changes</ActionButton>
              <ActionButton variant="primary" v-if="hasChanges" :disabled="saving" :loading="saving" @click="licenseDetailsStore.saveChanges">Save Changes</ActionButton>
            </div>
          </div>
          <div class="mt-1">✏️ before a queue name indicates that the queue location differs from what was licensed</div>
        </div>
        <RouterView />
      </div>
    </ConditionalRender>
  </ConditionalRender>

  <ConfirmDialog
    v-if="confirmReset"
    heading="Confirm Remove Endpoint Amendments"
    body="Are you sure you want to remove all endpoint and queue assignment amendments made since uploading the latest license metadata file?"
    @cancel="confirmReset = false"
    @confirm="removeAmendments"
  />
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

.license-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.license-details .details > div {
  margin-bottom: 0.5rem;
}

.license-expiry {
  max-width: 22em;
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

.tab-row {
  display: flex;
  justify-content: space-between;
  align-items: end;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

h5 a {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  /* prevent UI overlap if tabs wrap */
  margin-top: 0.25rem;
}
</style>
