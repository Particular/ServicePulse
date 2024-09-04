<script setup lang="ts">
import NoData from "../NoData.vue";
import { useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { storeToRefs } from "pinia";
import TimeSince from "../TimeSince.vue";
import routeLinks from "@/router/routeLinks";
import { Tippy } from "vue-tippy";
import { WarningLevel } from "@/components/WarningLevel";
import ExclamationMark from "@/components/ExclamationMark.vue";

const store = useHeartbeatsStore();
const { activeEndpoints, filteredActiveEndpoints } = storeToRefs(store);
</script>

<template>
  <section name="active_endpoints">
    <no-data v-if="activeEndpoints.length === 0" message="No healthy endpoints"></no-data>
    <div v-if="activeEndpoints.length > 0" class="row">
      <div class="col-sm-12 no-side-padding">
        <div class="row box box-no-click logical_endpoint" v-for="endpoint in filteredActiveEndpoints" :key="endpoint.name">
          <div class="col-sm-12 no-side-padding">
            <div class="row">
              <div class="col-sm-12 no-side-padding">
                <div class="row box-header">
                  <div class="col-sm-12 no-side-padding endpoint-name">
                    <div class="box-header">
                      <tippy v-if="endpoint.track_instances" content="Instances are being tracked" :delay="[1000, 0]">
                        <i class="fa fa-server text-success"></i>
                      </tippy>
                      <tippy v-else content="No tracking instances" :delay="[1000, 0]">
                        <i class="fa fa-sellsy text-success"></i>
                      </tippy>
                      <div :aria-label="endpoint.name" class="no-side-padding lead righ-side-ellipsis endpoint-details-link">
                        <RouterLink aria-label="details-link" :to="routeLinks.heartbeats.instances.link(endpoint.name)">
                          {{ endpoint.name }}
                        </RouterLink>
                      </div>
                      <span class="endpoint-count">{{ store.endpointDisplayName(endpoint) }} <exclamation-mark v-if="endpoint.track_instances && endpoint.down_count > 0" :type="WarningLevel.Danger" /> </span>
                    </div>
                    <p v-if="endpoint.heartbeat_information">latest heartbeat received <time-since :date-utc="endpoint.heartbeat_information?.last_report_at" /></p>
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
