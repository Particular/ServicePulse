<script setup lang="ts">
import NoData from "../NoData.vue";
import { useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { storeToRefs } from "pinia";
import TimeSince from "../TimeSince.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";
import { EndpointStatus } from "@/resources/Heartbeat";

const route = useRoute();
const endpointName = route.params.endpointName.toString();
const store = useHeartbeatsStore();
const { endpoints, filteredInstances } = storeToRefs(store);
const instances = computed(() => filteredInstances.value.filter((instance) => instance.name === endpointName));
const totalInstanceCount = computed(() => endpoints.value.filter((instance) => instance.name === endpointName).length);
</script>

<template>
  <h3>Instances for Endpoint {{ endpointName }} ({{ totalInstanceCount }})</h3>
  <section name="endpoint_instances">
    <no-data v-if="instances.length === 0" message="No endpoint instances found"></no-data>
    <div v-if="instances.length > 0" class="row">
      <div class="col-sm-12 no-side-padding">
        <div class="row box box-no-click logical_endpoint" v-for="instance in instances" :key="instance.id">
          <div class="col-sm-12 no-side-padding">
            <div class="row">
              <div class="col-sm-12 no-side-padding">
                <div class="row box-header">
                  <div class="col-sm-12 no-side-padding endpoint-name">
                    <p class="lead down" v-if="instance.heartbeat_information?.reported_status !== EndpointStatus.Alive">
                      {{ `${instance.name}@${instance.host_display_name}` }}
                      <a class="remove-item" @click="store.deleteEndpoint(instance)">
                        <i class="fa fa-trash" v-tooltip :title="`Remove endpoint from list`" />
                      </a>
                    </p>
                    <p class="lead" v-if="instance.heartbeat_information?.reported_status === EndpointStatus.Alive">
                      {{ `${instance.name}@${instance.host_display_name}` }}
                    </p>
                    <p>latest heartbeat received <time-since :date-utc="instance.heartbeat_information?.last_report_at" /></p>
                    <p v-if="!instance.heartbeat_information">No plugin installed</p>
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

.lead.down {
  color: red;
}

.fa-trash {
  color: red;
}
</style>
