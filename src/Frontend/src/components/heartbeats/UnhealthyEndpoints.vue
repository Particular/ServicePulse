<script setup lang="ts">
import NoData from "../NoData.vue";
import { useHeartbeatsStore, ColumnNames } from "@/stores/HeartbeatsStore";
import { storeToRefs } from "pinia";
import TimeSince from "../TimeSince.vue";
import SortableColumn from "@/components/SortableColumn.vue";
import routeLinks from "@/router/routeLinks";
import { Tippy } from "vue-tippy";

const store = useHeartbeatsStore();
const { unhealthyEndpoints, filteredUnhealthyEndpoints, sortByInstances } = storeToRefs(store);
</script>

<template>
  <section name="unhealthy_endpoints">
    <no-data v-if="unhealthyEndpoints.length === 0" message="No unhealthy endpoints"></no-data>
    <div v-if="unhealthyEndpoints.length > 0" class="row">
      <div class="col-sm-12 no-side-padding">
        <section role="table" aria-label="endpoint-instances">
          <!--Table headings-->
          <div role="row" aria-label="column-headers" class="row table-head-row">
            <div role="columnheader" :aria-label="ColumnNames.Name" class="col-6">
              <SortableColumn :sort-by="ColumnNames.Name" v-model="sortByInstances" :default-ascending="true">Host name</SortableColumn>
            </div>
            <div role="columnheader" :aria-label="ColumnNames.Instances" class="col-2">
              <SortableColumn :sort-by="ColumnNames.Instances" v-model="sortByInstances" :default-ascending="true">Instances</SortableColumn>
            </div>
            <div role="columnheader" :aria-label="ColumnNames.LastHeartbeat" class="col-2">
              <SortableColumn :sort-by="ColumnNames.LastHeartbeat" v-model="sortByInstances">Last Heartbeat</SortableColumn>
            </div>
            <div role="columnheader" :aria-label="ColumnNames.LastHeartbeat" class="col-1 centre">
              <SortableColumn :sort-by="ColumnNames.Tracked" v-model="sortByInstances">Tracked</SortableColumn>
            </div>
            <div role="columnheader" :aria-label="ColumnNames.LastHeartbeat" class="col-1 centre">
              <SortableColumn :sort-by="ColumnNames.Muted" v-model="sortByInstances">Muted</SortableColumn>
            </div>
          </div>
          <!--Table rows-->
          <div role="rowgroup" aria-label="endpoints">
            <div role="row" :aria-label="endpoint.name" class="row grid-row" v-for="endpoint in filteredUnhealthyEndpoints" :key="endpoint.name">
              <div role="cell" aria-label="instance-name" class="col-6 host-name">
                <div class="box-header">
                  <div :aria-label="endpoint.name" class="no-side-padding lead righ-side-ellipsis endpoint-details-link">
                    <RouterLink aria-label="details-link" :to="{ path: routeLinks.heartbeats.instances.link(endpoint.name), query: { back: routeLinks.heartbeats.unhealthy.link } }"> {{ endpoint.name }} </RouterLink>
                  </div>
                  <tippy v-if="!endpoint.monitor_heartbeat" content="All instances have alerts muted" :delay="[300, 0]">
                    <i class="fa fa-bell-slash text-danger" />
                  </tippy>
                </div>
              </div>
              <div role="cell" aria-label="instance-count" class="col-2">
                <span class="endpoint-count" :class="endpoint.alive_count === 0 ? '' : 'partial'">{{ store.endpointDisplayName(endpoint) }}</span>
              </div>
              <div role="cell" aria-label="last-heartbeat" class="col-2 last-heartbeat">
                <p v-if="endpoint.heartbeat_information"><time-since :date-utc="endpoint.heartbeat_information?.last_report_at" default-text-on-failure="unknown" /></p>
                <p v-else>No plugin installed</p>
              </div>
              <div role="cell" aria-label="tracked-instances" class="col-1 centre">
                <tippy v-if="endpoint.track_instances" content="Instances are being tracked" :delay="[1000, 0]">
                  <i class="fa fa-server text-danger"></i>
                </tippy>
                <tippy v-else content="No tracking instances" :delay="[1000, 0]">
                  <i class="fa fa-sellsy text-danger"></i>
                </tippy>
              </div>
              <div role="cell" aria-label="muted" class="col-1 centre">
                <tippy v-if="endpoint.muted_count === endpoint.alive_count + endpoint.down_count" content="All instances have alerts muted" :delay="[300, 0]">
                  <i class="fa fa-bell-slash text-danger" />
                </tippy>
                <tippy v-else-if="endpoint.muted_count > 0" :content="`${endpoint.muted_count} instances have alerts muted`" :delay="[300, 0]">
                  <i class="fa fa-bell-slash text-warning" />
                </tippy>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import "../list.css";
@import "./heartbeats.css";

.box-header {
  display: flex;
  gap: 0.5em;
}

.endpoint-count {
  color: var(--bs-danger);
}

.endpoint-count.partial {
  color: var(--bs-warning);
}
</style>
