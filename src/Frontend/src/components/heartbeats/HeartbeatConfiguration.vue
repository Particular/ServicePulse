<script setup lang="ts">
import { ColumnNames, useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { storeToRefs } from "pinia";
import NoData from "../NoData.vue";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";
import EndpointSettingsSupported from "@/components/heartbeats/EndpointSettingsSupported.vue";
import OnOffSwitch from "../OnOffSwitch.vue";
import HeartbeatsList from "./HeartbeatsList.vue";

const store = useHeartbeatsStore();
const { sortedEndpoints, filteredEndpoints, defaultTrackingInstancesValue } = storeToRefs(store);

async function toggleDefaultSetting() {
  try {
    await store.updateEndpointSettings({ name: "", track_instances: defaultTrackingInstancesValue.value });
    useShowToast(TYPE.SUCCESS, "Default setting updated", "", false, { timeout: 3000 });
  } catch {
    useShowToast(TYPE.ERROR, "Failed to update default setting", "", false, { timeout: 3000 });
  }
}
</script>

<template>
  <EndpointSettingsSupported>
    <div class="row">
      <div class="col format-showing-results">
        <div>Showing {{ filteredEndpoints.length }} of {{ sortedEndpoints.length }} result(s)</div>
      </div>
    </div>
    <section name="endpoint_configuration">
      <div class="row">
        <div class="col-9 no-side-padding">
          <no-data v-if="sortedEndpoints.length === 0" message="Nothing to configure" />
          <div v-else class="row no-side-padding">
            <HeartbeatsList :data="filteredEndpoints" :columns="[ColumnNames.Name, ColumnNames.InstancesTotal, ColumnNames.LastHeartbeat, ColumnNames.TrackToggle]" />
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
