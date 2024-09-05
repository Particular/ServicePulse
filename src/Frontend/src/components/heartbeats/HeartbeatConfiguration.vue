<script setup lang="ts">
import { ColumnNames, useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { storeToRefs } from "pinia";
import NoData from "../NoData.vue";
import TimeSince from "../TimeSince.vue";
import SortableColumn from "@/components/SortableColumn.vue";
import routeLinks from "@/router/routeLinks";
import { Tippy } from "vue-tippy";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";
import { LogicalEndpoint } from "@/resources/Heartbeat";
import EndpointSettingsSupported from "@/components/heartbeats/EndpointSettingsSupported.vue";
import OnOffSwitch from "../OnOffSwitch.vue";

const store = useHeartbeatsStore();
const { sortedEndpoints, filteredEndpoints, defaultTrackingInstancesValue, sortByInstances } = storeToRefs(store);

async function toggleDefaultSetting() {
  try {
    await store.updateEndpointSettings({ name: "", track_instances: defaultTrackingInstancesValue.value });
    useShowToast(TYPE.SUCCESS, "Default setting updated", "", false, { timeout: 3000 });
  } catch {
    useShowToast(TYPE.ERROR, "Failed to update default setting", "", false, { timeout: 3000 });
  }
}

async function changeEndpointSettings(endpoint: LogicalEndpoint) {
  try {
    await store.updateEndpointSettings(endpoint);
    useShowToast(TYPE.SUCCESS, "Saved", "", false, { timeout: 3000 });
  } catch {
    useShowToast(TYPE.ERROR, "Save failed", "", false, { timeout: 3000 });
  }
}

function endpointHealth(endpoint: LogicalEndpoint) {
  if (endpoint.alive_count === 0) return "text-danger";
  if (endpoint.track_instances) {
    return endpoint.down_count > 0 ? "text-warning" : "text-success";
  } else return "text-success";
}
</script>

<template>
  <EndpointSettingsSupported>
    <section name="endpoint_configuration">
      <div class="row">
        <div class="col-9 no-side-padding">
          <no-data v-if="sortedEndpoints.length === 0" message="Nothing to configure" />
          <div v-else class="row no-side-padding">
            <!--Table headings-->
            <div role="row" aria-label="column-headers" class="row table-head-row">
              <div role="columnheader" :aria-label="ColumnNames.Name" class="col-6">
                <SortableColumn :sort-by="ColumnNames.Name" v-model="sortByInstances" :default-ascending="true">Name</SortableColumn>
              </div>
              <div role="columnheader" :aria-label="ColumnNames.InstancesTotal" class="col-2">
                <SortableColumn :sort-by="ColumnNames.InstancesTotal" v-model="sortByInstances" :default-ascending="true">Instances</SortableColumn>
              </div>
              <div role="columnheader" :aria-label="ColumnNames.LastHeartbeat" class="col-2">
                <SortableColumn :sort-by="ColumnNames.LastHeartbeat" v-model="sortByInstances">Last Heartbeat</SortableColumn>
              </div>
              <div role="columnheader" :aria-label="ColumnNames.LastHeartbeat" class="col-2 centre">
                <SortableColumn :sort-by="ColumnNames.Tracked" v-model="sortByInstances">Track Instances</SortableColumn>
              </div>
            </div>
            <!--Table rows-->
            <div role="rowgroup" aria-label="endpoints">
              <div role="row" :aria-label="endpoint.name" class="row grid-row" v-for="endpoint in filteredEndpoints" :key="endpoint.name">
                <div role="cell" aria-label="instance-name" class="col-6 host-name">
                  <div class="box-header">
                    <tippy :aria-label="endpoint.name" :content="endpoint.name" class="no-side-padding lead righ-side-ellipsis endpoint-details-link">
                      <RouterLink aria-label="details-link" :to="{ path: routeLinks.heartbeats.instances.link(endpoint.name), query: { back: routeLinks.heartbeats.configuration.link } }"> {{ endpoint.name }} </RouterLink>
                    </tippy>
                  </div>
                </div>
                <div role="cell" aria-label="instance-count" class="col-2">
                  <i v-if="endpoint.track_instances" class="fa fa-server" :class="endpointHealth(endpoint)"></i>
                  <i v-else class="fa fa-sellsy" :class="endpointHealth(endpoint)"></i>
                  <span class="endpoint-count">{{ store.endpointDisplayName(endpoint) }}</span>
                </div>
                <div role="cell" aria-label="last-heartbeat" class="col-2 last-heartbeat">
                  <p v-if="endpoint.heartbeat_information"><time-since :date-utc="endpoint.heartbeat_information?.last_report_at" default-text-on-failure="unknown" /></p>
                  <p v-else>No plugin installed</p>
                </div>
                <div role="cell" aria-label="tracked-instances" class="col-2 centre">
                  <div class="switch">
                    <OnOffSwitch :id="endpoint.name" @toggle="changeEndpointSettings(endpoint)" v-model="endpoint.track_instances" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-3 instructions">
          <div class="defaultSetting">
            <label>Track Instances by default on new endpoints</label>
            <div class="switch">
              <OnOffSwitch id="defaultTIV" @toggle="toggleDefaultSetting" v-model="defaultTrackingInstancesValue" />
            </div>
          </div>
          <p>
            <template v-if="defaultTrackingInstancesValue">If most of your endpoints are auto-scaled, consider changing this setting.</template>
            <template v-else>If most of your endpoint are hosted in physical infrastructure, consider changing this setting.</template>
          </p>
          <p><code>Track Instances</code> is the best setting for endpoints where all instances are hosted in physical infrastructure that is not auto-scaled. Example, physical or virtual servers.</p>
          <p><code>Do Not Track Instances</code> is the best setting for endpoints that are hosted in infrastructure with autoscalers. Example, Kubernetes, Azure Container Apps and AWS Elastic Container Service.</p>
        </div>
      </div>
    </section>
  </EndpointSettingsSupported>
</template>

<style scoped>
@import "../list.css";
@import "./heartbeats.css";
.instructions {
  padding: 10px;
  p {
    color: unset;
  }
}

.defaultSetting {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1em;
  line-height: 1em;
}

.defaultSetting .switch {
  margin-top: -8px;
}

.instructions > div {
  margin-bottom: 5px;
}
</style>
