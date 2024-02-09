<script setup lang="ts">
import { licenseStatus } from "@/composables/serviceLicense";
import { connectionState } from "@/composables/serviceServiceControl";
import LicenseExpired from "@/components/LicenseExpired.vue";
import DataView from "@/components/DataView.vue";
import EventLogItem from "@/components/EventLogItem.vue";
import ServiceControlNotAvailable from "@/components/ServiceControlNotAvailable.vue";
import type EventLogItemType from "@/resources/EventLogItem";
import { ref } from "vue";

const items = ref<EventLogItemType[]>([]);
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <ServiceControlNotAvailable />
    <template v-if="connectionState.connected">
      <div class="events events-view">
        <DataView api-url="eventlogitems" v-model="items" :auto-refresh-seconds="5" :show-items-per-page="true" :items-per-page="20">
          <template #data>
            <div class="row">
              <div class="col-sm-12">
                <h1>Events</h1>
                <EventLogItem v-for="item of items" :eventLogItem="item" :key="item.id" />
              </div>
            </div>
          </template>
        </DataView>
      </div>
    </template>
  </template>
</template>

<style scoped>
.events {
  margin-top: 2em;
}
</style>
