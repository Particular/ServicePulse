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
      <DataView api-url="eventlogitems" :auto-refresh="5000" :show-items-per-page="true" :items-per-page="20">
        <template #data="items">
          <div class="row">
            <div class="col-sm-12">
              <h1>Events</h1>
              <EventLogItem v-for="item in items" :eventLogItem="item" :key="item.id" />
            </div>
          </div>
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
