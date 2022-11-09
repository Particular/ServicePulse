<script setup>
import DashboardItem from "../components/DashboardItem.vue";
import {inject} from "vue";
import EventItemShort from "../components/EventItemShort.vue"
import { key_Failedheartbeats,  key_Failedmessages, key_Failedcustomchecks } from "./../composables/keys.js"

const failedheartbeats = inject(key_Failedheartbeats)
const failedmessages = inject(key_Failedmessages)
const failedcustomchecks = inject(key_Failedcustomchecks)

</script>
<template>
  <div class="container">
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
                <DashboardItem :counter="failedheartbeats" :url="'/endpoints'" :iconClass="'fa-heartbeat'">Heartbeats</DashboardItem>
              </div>
              <div class="col-xs-4">
                <DashboardItem :counter="failedmessages" :url="'/failed-messages/groups'" :iconClass="'fa-envelope'">Failed Messages</DashboardItem>
              </div>
              <div class="col-xs-4">
                <DashboardItem :counter="failedcustomchecks" :url="'/custom-checks'" :iconClass="'fa-check'">Custom Checks</DashboardItem>
              </div>
            </div>
          </div>
        </div>

        <EventItemShort></EventItemShort>
      </div>
    </div>
  </div>
  
</template>
