<script setup lang="ts">
import NoData from "../NoData.vue";
import { useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { storeToRefs } from "pinia";
import TimeSince from "../TimeSince.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";
import { Endpoint, EndpointStatus } from "@/resources/Heartbeat";
import SortableColumn from "@/components/SortableColumn.vue";
import routeLinks from "@/router/routeLinks";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";

enum columnName {
  HostName = "name",
  LastHeartbeat = "heartbeatLength",
}

const route = useRoute();
const endpointName = route.params.endpointName.toString();
const store = useHeartbeatsStore();
const { filteredInstances, instanceFilterString, sortByInstances } = storeToRefs(store);
const instances = computed(() => filteredInstances.value.filter((instance) => instance.name === endpointName));

async function deleteInstance(instance: Endpoint) {
  await store.deleteEndpoint(instance);
  useShowToast(TYPE.SUCCESS, "Endpoint instance deleted", "", false, { timeout: 1000 });
}

async function toggleAlerts(instance: Endpoint) {
  await store.toggleEndpointMonitor(instance);
  useShowToast(TYPE.SUCCESS, `Endpoint instance ${instance.monitor_heartbeat ? "muted" : "unmuted"}`, "", false, { timeout: 1000 });
}
</script>

<template>
  <div class="row">
    <div class="col-8 instances-heading">
      <RouterLink :to="routeLinks.heartbeats.root">&#9664; Back to list</RouterLink>
      <h1>{{ endpointName }} Instances</h1>
    </div>
    <div class="col-4 align-content-center justify-content-end">
      <div role="search" aria-label="filter" class="filter-input">
        <input type="text" placeholder="Filter by name..." aria-label="filter by name" class="form-control-static filter-input" v-model="instanceFilterString" />
      </div>
    </div>
  </div>
  <section role="table" aria-label="endpoint-instances">
    <!--Table headings-->
    <div role="row" aria-label="column-headers" class="row table-head-row">
      <div role="columnheader" :aria-label="columnName.HostName" class="col-6">
        <SortableColumn :sort-by="columnName.HostName" v-model="sortByInstances" :default-ascending="true">Host name</SortableColumn>
      </div>
      <div role="columnheader" :aria-label="columnName.LastHeartbeat" class="col-2">
        <SortableColumn :sort-by="columnName.LastHeartbeat" v-model="sortByInstances">Last Heartbeat</SortableColumn>
      </div>
      <div role="columnheader" aria-label="actions" class="col-4">
        <div>Actions</div>
      </div>
    </div>
    <no-data v-if="instances.length === 0" message="No endpoint instances found"></no-data>
    <div role="rowgroup" aria-label="endpoints">
      <div role="row" :aria-label="instance.name" class="row instance-row" v-for="instance in instances" :key="instance.id">
        <div role="cell" aria-label="instance-name" class="col-6 host-name">
          <span role="status" class="logo">
            <i v-if="instance.heartbeat_information?.reported_status !== EndpointStatus.Alive" aria-label="instance dead" class="fa fa-heartbeat text-danger" />
            <i v-else aria-label="instance alive" class="fa fa-heartbeat text-success" />
          </span>
          <span class="lead">{{ instance.host_display_name }}</span>
        </div>
        <div role="cell" aria-label="last-heartbeat" class="col-2 last-heartbeat"><time-since :date-utc="instance.heartbeat_information?.last_report_at" default-text-on-failure="Unknown" /></div>
        <div role="cell" aria-label="last-heartbeat" class="col-4 actions">
          <button v-if="instance.heartbeat_information?.reported_status !== EndpointStatus.Alive" type="button" @click="deleteInstance(instance)" class="btn btn-danger btn-sm"><i class="fa fa-trash text-white" /> Delete</button>&nbsp;
          <button v-if="instance.monitor_heartbeat" type="button" @click="toggleAlerts(instance)" class="btn btn-info btn-sm"><i class="fa fa-bell-slash text-white" /> Mute Alerts</button>
          <button v-else type="button" @click="toggleAlerts(instance)" class="btn btn-warning btn-sm"><i class="fa fa-bell text-white" /> Unmute Alerts</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import "../list.css";
@import "./heartbeats.css";

.instances-heading h1 {
  margin-bottom: 10px;
}

.logo {
  width: 20px;
}

.actions {
  display: flex;
}
.host-name,
.last-heartbeat,
.actions {
  padding: 10px;
  align-items: center;
  display: flex;
}
.instance-row {
  display: flex;
  position: relative;
  border-top: 1px solid #eee;
  border-right: 1px solid #fff;
  border-bottom: 1px solid #eee;
  border-left: 1px solid #fff;
  background-color: #fff;
  margin: 0;
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

.pa-endpoint-lost {
  background-image: url("@/assets/endpoint-lost.svg");
  background-position: center;
  background-repeat: no-repeat;
  width: 26px;
  height: 26px;
  top: 4px;
  left: 6px;
}

.pa-endpoint {
  top: 3px;
  background-image: url("@/assets/endpoint.svg");
  background-position: center;
  background-repeat: no-repeat;
  height: 15px;
  width: 15px;
}
</style>
