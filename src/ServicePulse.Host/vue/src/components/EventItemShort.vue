<script setup>
import DataView from "../components/DataView.vue";
import EventLogItem from "../components/EventLogItem.vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="events">
    <DataView api-url="eventlogitems" :auto-refresh-seconds="5" :itemsPerPage="10" :show-pagination="false">
      <template #data="items">
        <div class="col-12">
          <h6>Last 10 events</h6>
          <EventLogItem v-for="item of items" :eventLogItem="item" :key="item.id" />
        </div>
      </template>
      <template #footer="{ count }">
        <div v-if="count > 10" class="row text-center">
          <div class="col-12">
            <RouterLink :to="{ name: 'events' }" class="btn btn-default btn-secondary btn-all-events">View all events</RouterLink>
          </div>
        </div>
      </template>
    </DataView>
  </div>
</template>

<style scoped>
.events {
  margin-top: 30px;
}

.btn.btn-all-events {
  width: 180px;
  margin-top: 30px;
}
</style>
