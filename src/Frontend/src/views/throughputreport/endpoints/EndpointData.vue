<script setup>
import { ref } from 'vue';
import EndpointDetails from './EndpointDetails.vue';
import EndpointHeader from './EndpointHeader.vue';
import CollapsedEndpoint from './CollapsedEndpoint.vue';
import PageControl from './components/PageControl.vue';
import { setEndpointElementReference } from './model/tabModel';
import useEndpointListModel from './model/endpointListModel';

const collapsedEndpoints = ref(new Map());
const endpointPageModel = useEndpointListModel();
const { pageItems } = endpointPageModel;
</script>

<template>
  <div class="actions mb-2">
    <div class="backdrop"></div>
    <PageControl
      v-model="endpointPageModel"
      @page-changed="collapsedEndpoints.clear()"
      :item-desc="(endpoint) => endpoint.name"
      class="pages"
    />
    <button type="button" class="btn btn-primary" @click="pageItems.forEach((endpoint) => collapsedEndpoints.set(endpoint, true))">
      Collapse All
    </button>
  </div>
  <div class="card mb-3" v-for="endpoint in pageItems" :ref="(el) => setEndpointElementReference(endpoint, el)">
    <CollapsedEndpoint
      class="card-header"
      v-if="collapsedEndpoints.get(endpoint)"
      :endpoint="endpoint"
      @expand="collapsedEndpoints.set(endpoint, false)"
    />
    <template v-else>
      <EndpointHeader :endpoint="endpoint" class="card-header" @collapse="collapsedEndpoints.set(endpoint, true)" />
      <EndpointDetails :endpoint="endpoint" />
    </template>
  </div>
</template>

<style scoped>
.card {
  margin-left: 0.5em;
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
  gap: 0.25rem;
  justify-content: space-between;
  align-items: end;
  position: sticky;
  top: 0;
  z-index: 10;
}

.actions .backdrop {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(16px);
  z-index: -1;
}

.pages {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
}
</style>
