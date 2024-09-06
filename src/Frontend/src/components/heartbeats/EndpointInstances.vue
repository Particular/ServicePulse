<script setup lang="ts">
import NoData from "../NoData.vue";
import { storeToRefs } from "pinia";
import TimeSince from "../TimeSince.vue";
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { EndpointStatus } from "@/resources/Heartbeat";
import SortableColumn from "@/components/SortableColumn.vue";
import DataView from "@/components/DataView.vue";
import OnOffSwitch from "../OnOffSwitch.vue";
import routeLinks from "@/router/routeLinks";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";
import { Tippy } from "vue-tippy";
import { useHeartbeatInstancesStore, ColumnNames } from "@/stores/HeartbeatInstancesStore";
import { EndpointsView } from "@/resources/EndpointView";
import endpointSettingsClient from "@/components/heartbeats/endpointSettingsClient";
import { EndpointSettings } from "@/resources/EndpointSettings";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

enum Operation {
  Mute = "mute",
  Unmute = "unmute",
}

const route = useRoute();
const endpointName = route.params.endpointName.toString();
const store = useHeartbeatInstancesStore();
const { filteredInstances, sortedInstances, instanceFilterString, sortByInstances } = storeToRefs(store);
const endpointSettings = ref<EndpointSettings[]>([endpointSettingsClient.defaultEndpointSettingsValue()]);
const backLink = ref<string>(routeLinks.heartbeats.root);
const filterInstances = (data: EndpointsView[]) =>
  data
    .filter((instance) => instance.name === endpointName)
    .filter((instance) => {
      const trackInstances = (endpointSettings.value.find((value) => value.name === instance.name) ?? endpointSettings.value.find((value) => value.name === ""))!.track_instances;
      if (!trackInstances && !instance.is_sending_heartbeats) {
        return false;
      }

      return true;
    });
const instances = computed(() => filterInstances(filteredInstances.value));
const totalInstances = computed(() => filterInstances(sortedInstances.value));
const showBulkWarningDialog = ref(false);
const dialogWarningOperation = ref(Operation.Mute);

onMounted(async () => {
  const back = useRouter().currentRoute.value.query.back as string;
  if (back) {
    backLink.value = back;
  }
  endpointSettings.value = await endpointSettingsClient.endpointSettings();
});

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
  for (const instance of instances.value) {
    if (dialogWarningOperation.value === Operation.Unmute && !instance.monitor_heartbeat) {
      tasks.push(store.toggleEndpointMonitor(instance));
    }
    if (dialogWarningOperation.value === Operation.Mute && instance.monitor_heartbeat) {
      tasks.push(store.toggleEndpointMonitor(instance));
    }
  }

  await Promise.all(tasks);
  useShowToast(TYPE.SUCCESS, `All endpoint instances ${dialogWarningOperation.value}`, "", false, { timeout: 1000 });
}

async function deleteInstance(instance: EndpointsView) {
  await store.deleteEndpointInstance(instance);
  useShowToast(TYPE.SUCCESS, "Endpoint instance deleted", "", false, { timeout: 1000 });
}

async function toggleAlerts(instance: EndpointsView) {
  await store.toggleEndpointMonitor(instance);
  useShowToast(TYPE.SUCCESS, `Endpoint instance ${!instance.monitor_heartbeat ? "muted" : "unmuted"}`, "", false, { timeout: 1000 });
}
</script>

<template>
  <Teleport to="#modalDisplay">
    <ConfirmDialog
      v-if="showBulkWarningDialog"
      heading="Proceed with bulk operation"
      :body="`Are you sure you want to ${dialogWarningOperation} ${instances.length} endpoint instance(s)?`"
      @cancel="cancelWarningDialog"
      @confirm="proceedWarningDialog"
    />
  </Teleport>
  <div class="container">
    <div class="row">
      <div class="col-8 instances-heading">
        <RouterLink :to="backLink"><i class="fa fa-chevron-left"></i> Back</RouterLink>
        <h1>{{ endpointName }} Instances</h1>
      </div>
      <div class="col-4 align-content-center">
        <div class="searchContainer">
          <div role="search" aria-label="filter" class="filter-input">
            <input type="search" placeholder="Filter by name..." aria-label="filter by name" class="form-control-static filter-input" v-model="instanceFilterString" />
          </div>
        </div>
      </div>
    </div>
    <div class="row filters">
      <span class="buttonsContainer">
        <button type="button" class="btn btn-warning btn-sm" :disabled="instances.length === 0" @click="showBulkOperationWarningDialog(Operation.Mute)"><i class="fa fa-bell-slash text-white" /> Mute Alerts on All</button>
        <button type="button" class="btn btn-default btn-sm" :disabled="instances.length === 0" @click="showBulkOperationWarningDialog(Operation.Unmute)"><i class="fa fa-bell" /> Unmute Alerts on All</button>
      </span>
    </div>
    <div class="row">
      <div class="col format-showing-results">
        <div>Showing {{ instances.length }} of {{ totalInstances.length }} result(s)</div>
      </div>
    </div>
    <section role="table" aria-label="endpoint-instances">
      <!--Table headings-->
      <div role="row" aria-label="column-headers" class="row table-head-row" :style="{ borderTop: 0 }">
        <div role="columnheader" :aria-label="ColumnNames.HostName" class="col-6">
          <SortableColumn :sort-by="ColumnNames.HostName" v-model="sortByInstances" :default-ascending="true">Host name</SortableColumn>
        </div>
        <div role="columnheader" :aria-label="ColumnNames.LastHeartbeat" class="col-2">
          <SortableColumn :sort-by="ColumnNames.LastHeartbeat" v-model="sortByInstances">Last Heartbeat</SortableColumn>
        </div>
        <div role="columnheader" :aria-label="ColumnNames.MuteToggle" class="col-2 centre">
          <SortableColumn :sort-by="ColumnNames.MuteToggle" v-model="sortByInstances">Mute Alerts</SortableColumn>
          <tippy max-width="400px">
            <i :style="{ fontSize: '1.1em', marginLeft: '0.25em' }" class="fa fa-info-circle text-primary" />
            <template #content>
              <span>Mute an instance when you are planning to take the instance offline to do maintenance or some other reason. This will prevent alerts on the dashboard.</span>
            </template>
          </tippy>
        </div>
        <div role="columnheader" aria-label="actions" class="col-1">
          <div>
            Actions
            <tippy max-width="400px">
              <i :style="{ fontSize: '1.1em' }" class="fa fa-info-circle text-primary" />
              <template #content>
                <table>
                  <tr>
                    <td style="padding: 3px; width: 6em; text-align: end; align-content: center">
                      <button type="button" class="btn btn-danger btn-sm"><i class="fa fa-trash text-white" /> Delete</button>
                    </td>
                    <td style="padding: 3px">Delete an instance when that instance has been decommissioned.</td>
                  </tr>
                </table>
              </template>
            </tippy>
          </div>
        </div>
      </div>
      <no-data v-if="instances.length === 0" message="No endpoint instances found. For untracked endpoints, disconnected instances are automatically pruned."></no-data>
      <!--Table rows-->
      <DataView :data="instances" :show-items-per-page="true" :items-per-page="20">
        <template #data="{ pageData }">
          <div role="rowgroup" aria-label="endpoints">
            <div role="row" :aria-label="instance.name" class="row grid-row" v-for="instance in pageData" :key="instance.id">
              <div role="cell" aria-label="instance-name" class="col-6 host-name">
                <span role="status" class="logo">
                  <i v-if="instance.heartbeat_information?.reported_status !== EndpointStatus.Alive" aria-label="instance dead" class="fa fa-heartbeat text-danger" />
                  <i v-else aria-label="instance alive" class="fa fa-heartbeat text-success" />
                </span>
                <span class="lead">{{ instance.host_display_name }}</span>
              </div>
              <div role="cell" aria-label="last-heartbeat" class="col-2 last-heartbeat"><time-since :date-utc="instance.heartbeat_information?.last_report_at" default-text-on-failure="Unknown" /></div>
              <div role="cell" aria-label="mute toggle" class="col-2 centre">
                <div class="switch">
                  <OnOffSwitch :id="instance.host_display_name" @toggle="toggleAlerts(instance)" :value="!instance.monitor_heartbeat" />
                </div>
              </div>
              <div role="cell" aria-label="actions" class="col-1 actions">
                <button v-if="instance.heartbeat_information?.reported_status !== EndpointStatus.Alive" type="button" @click="deleteInstance(instance)" class="btn btn-danger btn-sm"><i class="fa fa-trash text-white" /> Delete</button>&nbsp;
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </section>
  </div>
</template>

<style scoped>
@import "../list.css";
@import "./heartbeats.css";

.searchContainer {
  display: flex;
  justify-content: flex-end;
}

.instances-heading h1 {
  margin-bottom: 10px;
}

.logo {
  width: 16px;
  margin-right: 4px;
}

.actions {
  display: flex;
}

.filter-input input {
  display: inline-block;
  width: 100%;
  padding-right: 10px;
  padding-left: 30px;
  border: 1px solid #aaa;
  border-radius: 4px;
}

div.filter-input {
  position: relative;
  width: 280px;
}

.filter-input {
  height: 36px;
}

.filter-input:before {
  font-family: "FontAwesome";
  width: 1.43em;
  content: "\f0b0";
  color: #919e9e;
  position: absolute;
  top: calc(50% - 0.7em);
  left: 0.75em;
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
</style>
