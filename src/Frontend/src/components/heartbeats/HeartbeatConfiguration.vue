<script setup lang="ts">
import { useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { storeToRefs } from "pinia";
import NoData from "../NoData.vue";
import TimeSince from "../TimeSince.vue";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";
import { Endpoint } from "@/resources/Heartbeat";
import ValueToggle from "../ValueToggle.vue";

const store = useHeartbeatsStore();
const { sortedEndpoints, defaultTrackingInstancesValue } = storeToRefs(store);
async function toggleDefaultSetting() {
  await store.updateEndpointSettings({ name: "", track_instances: defaultTrackingInstancesValue.value });
  useShowToast(TYPE.SUCCESS, `Default setting updated`, "", false, { timeout: 3000 });
}

function changeEndpointSettings(endpoint: Endpoint) {
  store.updateEndpointSettings(endpoint);
}
</script>

<template>
  <section name="endpoint_configuration">
    <div class="row">
      <div class="col-sm-12 no-side-padding">
        <div class="alert alert-warning">
          <i class="fa fa-warning" />
          <strong>Warning:</strong> The list of endpoints below only contains endpoints with the heartbeats plug-in installed. Toggling heartbeat monitoring won't toggle
          <a href="https://docs.particular.net/monitoring/metrics/in-servicepulse" target="_blank">performance monitoring</a>
          <i class="fa fa-external-link fake-link" />
        </div>
        <div class="row">
          <div class="col-9 no-side-padding">
            <no-data v-if="sortedEndpoints.length === 0" message="Nothing to configure" />
            <div class="row box box-no-click no-side-padding" v-for="endpoint in sortedEndpoints" :key="endpoint.id">
              <div class="col-sm-12 no-side-padding">
                <div class="row">
                  <div class="col-8">
                    <div class="row box-header">
                      <div class="col-xs-12">
                        <p class="lead">{{ endpoint.name }}</p>
                        <p class="endpoint-metadata"><i class="fa fa-heartbeat"></i> <time-since :date-utc="endpoint.heartbeat_information?.last_report_at" default-text-on-failure="No recent heartbeat information available" /></p>
                        <p class="endpoint-metadata" v-if="!endpoint.heartbeat_information"><i class="fa fa-plug"></i> No heartbeat plugin installed</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-4">
                    <ValueToggle :id="endpoint.id" value1="Do Not Track Instances" value2="Track Instances" width="14.5em" @toggle="() => changeEndpointSettings(endpoint)" v-model="endpoint.track_instances" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-3 instructions">
            <div>
              <div class="defaultSetting">
                <label>Default For New Endpoints:</label>
                <ValueToggle id="defaultTIV" value1="Do Not Track Instances" value2="Track Instances" width="14.5em" @toggle="toggleDefaultSetting" v-model="defaultTrackingInstancesValue" />
              </div>
              <template v-if="defaultTrackingInstancesValue">If most of your endpoints are autoscaled, consider changing this setting.</template>
              <template v-else>If most of your endpoint are hosted in physical infrastructure, consider changing this setting.</template>
            </div>
            <p><code>Track Instances</code> is the best setting for endpoints where all instances are hosted in physical infrastructure that is not auto-scaled. Example, physical or virtual servers.</p>
            <p><code>Do Not Track Instances</code> is the best setting for endpoints that are hosted in infrastructure with autoscalers. Example, Kubernetes, Azure Container Apps and AWS Elastic Container Service.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
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
  line-height: 20px;
}

.instructions > div {
  margin-bottom: 5px;
}
</style>
