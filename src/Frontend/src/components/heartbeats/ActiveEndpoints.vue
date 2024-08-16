<script setup lang="ts">
import NoData from "../NoData.vue";
import { useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { storeToRefs } from "pinia";
import TimeSince from "../TimeSince.vue";
import routeLinks from "@/router/routeLinks";

const store = useHeartbeatsStore();
const { activeEndpoints, filteredActiveEndpoints } = storeToRefs(store);
</script>

<template>
  <section name="active_endpoints">
    <no-data v-if="activeEndpoints.length === 0" message="No active endpoints"></no-data>
    <div v-if="activeEndpoints.length > 0" class="row">
      <div class="col-sm-12 no-side-padding">
        <div class="row box box-no-click logical_endpoint" v-for="endpoint in filteredActiveEndpoints" :key="endpoint.id">
          <div class="col-sm-12 no-side-padding">
            <div class="row">
              <div class="col-sm-12 no-side-padding">
                <div class="row box-header">
                  <div class="col-sm-12 no-side-padding endpoint-name">
                    <div class="box-header">
                      <div :aria-label="endpoint.name" class="no-side-padding lead righ-side-ellipsis endpoint-details-link">
                        <RouterLink aria-label="details-link" :to="routeLinks.heartbeats.active.link" class="cursorpointer" v-tooltip :title="endpoint.name">
                          {{ endpoint.name }}
                        </RouterLink>
                      </div>
                      <span class="endpoint-count">{{ store.endpointDisplayName(endpoint) }}</span>
                    </div>
                    <p>latest heartbeat received <time-since :date-utc="endpoint.heartbeat_information?.last_report_at" /></p>
                    <p v-if="!endpoint.heartbeat_information">No plugin installed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import "../list.css";

.lead.endpoint-details-link.righ-side-ellipsis {
  color: #00729c;
  margin: 0;
}

.endpoint-name > div > div > a {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: #00729c;
  border-bottom: 1px dotted lightgrey;
}

.endpoint-name,
.endpoint-name > div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
}

.endpoint-name {
  gap: 0.25em;
}

.endpoint-name .box-header {
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  max-width: 100%;
}

.endpoint-name .box-header > *:not(:first-child) {
  margin-left: 0.25em;
}

.endpoint-count {
  font-weight: bold;
}

p:not(.lead) {
  color: #777f7f;
  margin: 0 0 5px;
}
</style>
