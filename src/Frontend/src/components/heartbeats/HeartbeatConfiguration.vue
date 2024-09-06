<script setup lang="ts">
import { ColumnNames, useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { storeToRefs } from "pinia";
import NoData from "../NoData.vue";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";
import EndpointSettingsSupported from "@/components/heartbeats/EndpointSettingsSupported.vue";
import OnOffSwitch from "../OnOffSwitch.vue";
import HeartbeatsList from "./HeartbeatsList.vue";
import { ref } from "vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

enum Operation {
  Track = "track",
  DoNotTrack = "do not track",
}

const store = useHeartbeatsStore();
const { sortedEndpoints, filteredEndpoints, defaultTrackingInstancesValue } = storeToRefs(store);
const showBulkWarningDialog = ref(false);
const dialogWarningOperation = ref(Operation.Track);

function showBulkOperationWarningDialog(operation: Operation) {
  dialogWarningOperation.value = operation;
  showBulkWarningDialog.value = true;
}

function cancelWarningDialog() {
  showBulkWarningDialog.value = false;
}

async function proceedWarningDialog() {
  showBulkWarningDialog.value = false;

  const tasks: Promise<void>[] = [];
  for (const endpoint of filteredEndpoints.value) {
    if (dialogWarningOperation.value === Operation.Track && !endpoint.track_instances) {
      tasks.push(store.updateEndpointSettings(endpoint));
    }
    if (dialogWarningOperation.value === Operation.DoNotTrack && endpoint.track_instances) {
      tasks.push(store.updateEndpointSettings(endpoint));
    }
  }

  await Promise.all(tasks);
  useShowToast(TYPE.SUCCESS, `All endpoints set to '${dialogWarningOperation.value}'`, "", false, { timeout: 1000 });
}

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
    <Teleport to="#modalDisplay">
      <ConfirmDialog
        v-if="showBulkWarningDialog"
        heading="Proceed with bulk operation"
        :body="`Are you sure you want to set ${filteredEndpoints.length} endpoint(s) to be '${dialogWarningOperation}'?`"
        @cancel="cancelWarningDialog"
        @confirm="proceedWarningDialog"
      />
    </Teleport>
    <div class="row filters">
      <span class="buttonsContainer">
        <button type="button" class="btn btn-default btn-sm" :disabled="filteredEndpoints.length === 0" @click="showBulkOperationWarningDialog(Operation.Track)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="icon">
            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path
              d="M309.6 158.5L332.7 19.8C334.6 8.4 344.5 0 356.1 0c7.5 0 14.5 3.5 19 9.5L392 32l52.1 0c12.7 0 24.9 5.1 33.9 14.1L496 64l56 0c13.3 0 24 10.7 24 24l0 24c0 44.2-35.8 80-80 80l-32 0-16 0-21.3 0-5.1 30.5-112-64zM416 256.1L416 480c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-115.2c-24 12.3-51.2 19.2-80 19.2s-56-6.9-80-19.2L160 480c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-230.2c-28.8-10.9-51.4-35.3-59.2-66.5L1 167.8c-4.3-17.1 6.1-34.5 23.3-38.8s34.5 6.1 38.8 23.3l3.9 15.5C70.5 182 83.3 192 98 192l30 0 16 0 159.8 0L416 256.1zM464 80a16 16 0 1 0 -32 0 16 16 0 1 0 32 0z"
            />
          </svg>
          Track All Endpoints
        </button>
        <button type="button" class="btn btn-default btn-sm" :disabled="filteredEndpoints.length === 0" @click="showBulkOperationWarningDialog(Operation.DoNotTrack)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon">
            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path
              d="M320 64c14.4 0 22.3-7 30.8-14.4C360.4 41.1 370.7 32 392 32c49.3 0 84.4 152.2 97.9 221.9C447.8 272.1 390.9 288 320 288s-127.8-15.9-169.9-34.1C163.6 184.2 198.7 32 248 32c21.3 0 31.6 9.1 41.2 17.6C297.7 57 305.6 64 320 64zM111.1 270.7c47.2 24.5 117.5 49.3 209 49.3s161.8-24.8 208.9-49.3c24.8-12.9 49.8-28.3 70.1-47.7c7.9-7.9 20.2-9.2 29.6-3.3c9.5 5.9 13.5 17.9 9.9 28.5c-13.5 37.7-38.4 72.3-66.1 100.6C523.7 398.9 443.6 448 320 448s-203.6-49.1-252.5-99.2C39.8 320.4 14.9 285.8 1.4 248.1c-3.6-10.6 .4-22.6 9.9-28.5c9.5-5.9 21.7-4.5 29.6 3.3c20.4 19.4 45.3 34.8 70.1 47.7z"
            />
          </svg>
          Do Not Track All Endpoints
        </button>
      </span>
    </div>
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
              <OnOffSwitch id="defaultTIV" @toggle="toggleDefaultSetting" :value="defaultTrackingInstancesValue" />
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
.filters {
  background-color: #f3f3f3;
  margin-top: 5px;
  border: #8c8c8c 1px solid;
  border-radius: 3px;
  padding: 5px;
}
.buttonsContainer {
  display: flex;
  gap: 10px;
}
.icon {
  width: 18px;
  height: 18px;
  //vertical-align: -0.125em;
}
</style>
