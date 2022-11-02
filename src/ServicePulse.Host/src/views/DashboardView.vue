<script setup>
import DashboardItem from "../components/DashboardItem.vue";

</script>
<template>
  <div class="row">
    <div class="col-sm-12">
      <h1>Dashboard</h1>
    </div>
  </div>

  <div class="row">
    <div class="col-sm-12">
      <h6>System status</h6>
      <div class="row box system-status">
        <div class="col-sm-12">
          <div class="row">
            <div class="col-xs-4">
              <DashboardItem :counter="10" :url="'/endpoints'" :iconClass="'fa-heartbeat'">Heartbeats</DashboardItem>
            </div>
            <div class="col-xs-4">
              <DashboardItem :counter="20" :url="'/failed-messages/groups'" :iconClass="'fa-envelope'">Failed Messages</DashboardItem>
            </div>
            <div class="col-xs-4">
              <DashboardItem :counter="30" :url="'/custom-checks'" :iconClass="'fa-check'">Custom Checks</DashboardItem>
            </div>
          </div>

        </div>
      </div>


    </div>
  </div>
  
</template>
