<script setup lang="ts">
import NoData from "../NoData.vue";
import { useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { storeToRefs } from "pinia";
import TimeSince from "../TimeSince.vue";
import routeLinks from "@/router/routeLinks";
import { Tippy } from "vue-tippy";

const store = useHeartbeatsStore();
const { inactiveEndpoints, filteredInactiveEndpoints } = storeToRefs(store);
</script>

<template>
  <section name="inactive_endpoints">
    <no-data v-if="inactiveEndpoints.length === 0" message="No unhealthy endpoints"></no-data>
    <div v-if="inactiveEndpoints.length > 0" class="row">
      <div class="col-sm-12 no-side-padding">
        <div class="row box box-no-click" v-for="endpoint in filteredInactiveEndpoints" :key="endpoint.name">
          <div class="col-sm-12 no-side-padding">
            <div class="row">
              <div class="col-sm-12 no-side-padding">
                <div class="row box-header">
                  <div class="col-sm-12 no-side-padding endpoint-name">
                    <div class="box-header">
                      <tippy v-if="endpoint.track_instances" content="Instances are being tracked" :delay="[1000, 0]">
                        <i class="fa fa-server text-danger"></i>
                      </tippy>
                      <tippy v-else content="No tracking instances" :delay="[1000, 0]">
                        <i class="fa fa-sellsy text-danger"></i>
                      </tippy>
                      <div :aria-label="endpoint.name" class="no-side-padding lead righ-side-ellipsis endpoint-details-link">
                        <RouterLink aria-label="details-link" :to="routeLinks.heartbeats.instances.link(endpoint.name)"> {{ endpoint.name }} </RouterLink>
                      </div>
                      <span class="endpoint-count">{{ store.endpointDisplayName(endpoint) }}</span>
                      <tippy v-if="!endpoint.monitor_heartbeat" content="All instances have alerts muted" :delay="[300, 0]">
                        <i class="fa fa-bell-slash text-danger" />
                      </tippy>
                    </div>
                    <p v-if="endpoint.heartbeat_information">latest heartbeat received <time-since :date-utc="endpoint.heartbeat_information?.last_report_at" default-text-on-failure="unknown" /></p>
                    <p v-else>No plugin installed</p>
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
</style>
