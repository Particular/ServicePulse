<script setup>
import { licenseStatus } from "../composables/serviceLicense";
import LicenseExpired from "../components/LicenseExpired.vue";
import DataView from "../components/DataView.vue";
import EventLogItem from "../components/EventLogItem.vue";
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <div class="events events-view">
      <DataView api-url="eventlogitems" :auto-refresh="5000" :items-per-page-options="[20, 35, 50, 75]" :items-per-page="20">
        <template #header><h1>Events</h1></template>
        <template #item="item">
          <EventLogItem :eventLogItem="item" />
        </template>
      </DataView>
    </div>
  </template>
</template>

<style>
/* TODO: Fix up styles */

.events {
  margin-top: 30px;
}
</style>
