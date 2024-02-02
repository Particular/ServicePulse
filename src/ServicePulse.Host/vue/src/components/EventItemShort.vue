<script setup>
import DataView from "../components/DataView.vue";
import EventLogItem from "../components/EventLogItem.vue";
</script>

<template>
  <div class="events">
    <DataView api-url="eventlogitems" :auto-refresh="5000" :itemsPerPage="10" :show-pagination="false">
      <template #data="items">
        <div class="col-12">
          <h6>Last 10 events</h6>
          <EventLogItem v-for="item of items" :eventLogItem="item" :key="item.id" />
        </div>
      </template>
      <template #footer="{ count }">
        <div v-if="count > 10" class="row text-center">
          <div class="col-12">
            <a class="btn btn-default btn-secondary btn-all-events" href="/#/events">View all events</a>
          </div>
        </div>
      </template>
    </DataView>
  </div>
</template>

<style>
.row.box.box-event-item {
  padding-top: 12px;
  padding-bottom: 12px;
}

.box-event-item .fa-stack {
  height: 1em;
}

.row.box.box-event-item,
.row.box.box-event-item .col-12 {
  padding-top: 8px;
  padding-bottom: 2px;
  width: 100%;
}

.events {
  margin-top: 30px;
}

.events .box {
  padding-bottom: 0;
}

.events .box:hover {
  cursor: pointer;
  background-color: #edf6f7;
  border: 1px solid #00a3c4;
}

.events p.lead {
  padding-bottom: 10px;
}

.box-warning {
  border-left-color: #aa6708;
}

.box-danger {
  border-left-color: #ce4844;
}

.box-header {
  padding-bottom: 3px;
  padding-top: 2px;
}

.box-header ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.box {
  box-shadow: none;
  margin: 0 !important;
  padding-bottom: 10px;
}

.fa-stack-2x {
  font-size: 24px !important;
}

.lead {
  word-wrap: break-word;
  color: #181919 !important;
  font-size: 14px !important;
  font-weight: bold !important;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn.btn-all-events {
  width: 180px;
  margin-top: 30px;
}
</style>
