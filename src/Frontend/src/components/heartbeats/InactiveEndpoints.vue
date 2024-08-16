<script setup lang="ts">
import NoData from "../NoData.vue";
import { useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { storeToRefs } from "pinia";
import TimeSince from "../TimeSince.vue";
import routeLinks from "@/router/routeLinks";

const store = useHeartbeatsStore();
const { inactiveEndpoints, filteredInactiveEndpoints } = storeToRefs(store);
</script>

<template>
  <section name="inactive_endpoints">
    <no-data v-if="inactiveEndpoints.length === 0" message="No inactive endpoints"></no-data>
    <div v-if="inactiveEndpoints.length > 0" class="row">
      <div class="col-sm-12 no-side-padding">
        <div class="row box box-no-click" v-for="endpoint in filteredInactiveEndpoints" :key="endpoint.id">
          <div class="col-sm-12 no-side-padding">
            <div class="row">
              <div class="col-sm-12 no-side-padding">
                <div class="row box-header">
                  <div class="col-sm-12 no-side-padding endpoint-name">
                    <div class="box-header">
                      <div :aria-label="endpoint.name" class="no-side-padding lead righ-side-ellipsis endpoint-details-link">
                        <RouterLink aria-label="details-link" :to="routeLinks.heartbeats.inactive.link" class="cursorpointer" v-tooltip :title="endpoint.name">
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
@import "./heartbeats.css";

a.remove-item {
  margin-left: 5px;
  outline: none;
  border: none;
}

a.remove-item .fa {
  color: #00a3c4;
}
</style>
