<script setup lang="ts">
import { useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { storeToRefs } from "pinia";
import NoData from "../NoData.vue";
import TimeSince from "../TimeSince.vue";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";
import { LogicalEndpoint } from "@/resources/Heartbeat";
import EndpointSettingsSupported from "@/components/heartbeats/EndpointSettingsSupported.vue";
import OnOffSwitch from "../OnOffSwitch.vue";

const store = useHeartbeatsStore();
const { sortedEndpoints, defaultTrackingInstancesValue } = storeToRefs(store);
const dropdownOptions = [
  { text: "Track Instances", value: true },
  { text: "Do Not Track Instances", value: false },
];
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
</script>

<template>
  <EndpointSettingsSupported>
    <section name="endpoint_configuration">
      <div class="row">
        <div class="col-9 no-side-padding">
          <no-data v-if="sortedEndpoints.length === 0" message="Nothing to configure" />
          <div class="row box box-no-click no-side-padding" v-for="endpoint in sortedEndpoints" :key="endpoint.name">
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
                  <select class="form-select dropDownOptions" @change="() => changeEndpointSettings(endpoint)">
                    <option :value="item.value" :selected="endpoint.track_instances === item.value" v-for="item in dropdownOptions" :key="item.text">{{ item.text }}</option>
                  </select>
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

.dropDownOptions {
  width: 250px;
}
</style>
