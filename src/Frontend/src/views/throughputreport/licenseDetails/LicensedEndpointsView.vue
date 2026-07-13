<script setup lang="ts">
import DataView from "@/components/DataView.vue";
import { computed, reactive } from "vue";
import CollapsedEndpoint from "./CollapsedEndpoint.vue";
import EndpointHeader from "./EndpointHeader.vue";
import EndpointDetails from "./EndpointDetails.vue";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore.ts";
import { storeToRefs } from "pinia";

const licenseDetailsStore = useLicenseDetailsStore();
const { endpoints } = storeToRefs(licenseDetailsStore);

const collapsedEndpoints = reactive(new Map());
const collapsedLength = computed(() => [...collapsedEndpoints.values()].filter((value) => value).length);
</script>

<template>
  <div class="mt-2">
    <DataView :data="endpoints" :items-per-page="5" @page-changed="collapsedEndpoints.clear()">
      <template #data="{ pageData, pageNumber }">
        <!--parent div with key ensures that any state for the details below is reset on page change-->
        <div :key="pageNumber">
          <div class="actions mb-2">
            <div class="backdrop"></div>
            <button type="button" class="btn btn-default" :disabled="collapsedLength === 0" @click="pageData.forEach((endpoint) => collapsedEndpoints.set(endpoint, false))">Expand All</button>
            <button type="button" class="btn btn-default" :disabled="collapsedLength === pageData.length" @click="pageData.forEach((endpoint) => collapsedEndpoints.set(endpoint, true))">Collapse All</button>
          </div>
          <div class="card mb-3" v-for="endpoint in pageData">
            <CollapsedEndpoint class="card-header" v-if="collapsedEndpoints.get(endpoint)" :endpoint="endpoint" @expand="collapsedEndpoints.set(endpoint, false)" />
            <template v-else>
              <EndpointHeader :endpoint="endpoint" class="card-header" @collapse="collapsedEndpoints.set(endpoint, true)" />
              <EndpointDetails :endpoint="endpoint" />
            </template>
          </div>
        </div>
      </template>
    </DataView>
  </div>
</template>

<style scoped>
.card {
  --full: hsl(196deg 100% 31%);
  --send-only: hsl(159deg 100% 31%);
  --shadow-color: 215deg 50% 30%;
  box-shadow:
    0px 0.1px 0.4px hsl(var(--shadow-color) / 0.34),
    0px 0.1px 0.4px 0.7px hsl(var(--shadow-color) / 0.3),
    0px 0.4px 1.2px 1.4px hsl(var(--shadow-color) / 0.25),
    0px 1px 3px 2.1px hsl(var(--shadow-color) / 0.21),
    0px 2.3px 7px 2.9px hsl(var(--shadow-color) / 0.17),
    0px 4.3px 13.2px 3.6px hsl(var(--shadow-color) / 0.13),
    0px 7.3px 22.4px 4.3px hsl(var(--shadow-color) / 0.09),
    0px 11.6px 35.6px 5px hsl(var(--shadow-color) / 0.04);
}

.actions {
  display: flex;
  gap: 5px;
  position: sticky;
  /* the main container-fluid has 40px of top padding */
  top: -40px;
  z-index: 10;
}

.actions .backdrop {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(16px);
  z-index: -1;
}
</style>
