<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getEventLogItems } from "../composables/eventLogItems";
import TimeSince from "./TimeSince.vue";

const router = useRouter();
const eventLogItems = ref([]);
const eventCount = ref(0);
onMounted(async () => {
  const data = await getEventLogItems();
  eventCount.value = data.length;
  eventLogItems.value = data.slice(0, 10);
});

function iconClasses(eventItem) {
  return {
    normal: eventItem.severity === "info",
    danger: eventItem.severity === "error",
    "fa-heartbeat": eventItem.category === "Endpoints" || eventItem.category === "EndpointControl" || eventItem.category === "HeartbeatMonitoring",
    "fa-check": eventItem.category === "CustomChecks",
    "fa-envelope": eventItem.category === "MessageFailures" || eventItem.category === "Recoverability",
    "pa-redirect-source pa-redirect-large": eventItem.category === "MessageRedirects",
    "fa-exclamation": eventItem.category === "ExternalIntegrations",
  };
}

function iconSubClasses(eventItem) {
  return {
    "fa-times fa-error": (eventItem.severity === "error" || eventItem.category === "MessageRedirects") && eventItem.severity === "error",
    "fa-pencil": (eventItem.severity === "error" || eventItem.category === "MessageRedirects") && eventItem.category === "MessageRedirects" && eventItem.event_type === "MessageRedirectChanged",
    "fa-plus": (eventItem.severity === "error" || eventItem.category === "MessageRedirects") && eventItem.category === "MessageRedirects" && eventItem.event_type === "MessageRedirectCreated",
    "fa-trash": (eventItem.severity === "error" || eventItem.category === "MessageRedirects") && eventItem.category === "MessageRedirects" && eventItem.event_type === "MessageRedirectRemoved",
  };
}

function navigateToEvent(eventLogItem) {
  switch (eventLogItem.category) {
    case "Endpoints":
      router.push("/configuration/endpoint-connection");
      break;
    case "HeartbeatMonitoring":
      window.location = "/a/#/endpoints";
      break;
    case "CustomChecks":
      window.location = "/a/#/custom-checks";
      break;
    case "EndpointControl":
      window.location = "/a/#/endpoints";
      break;
    case "MessageFailures":
      var newlocation = "/failed-messages";
      if (eventLogItem.related_to && eventLogItem.related_to.length > 0 && eventLogItem.related_to[0].search("message") > 0) {
        newlocation = "/failed-messages" + eventLogItem.related_to[0];
      }
      router.push(newlocation);
      break;
    case "Recoverability":
      router.push("/failed-messages");
      break;
    case "MessageRedirects":
      router.push("/configuration/retry-redirects");
      break;
    default:
  }
}
</script>

<template>
  <div class="row events">
    <div class="col-12">
      <h6>Last 10 events</h6>

      <div class="row box box-event-item" v-for="eventLogItem in eventLogItems" :key="eventLogItem.id">
        <div class="col-12" @click="navigateToEvent(eventLogItem)">
          <div class="row">
            <div class="col-1">
              <span class="fa-stack fa-lg">
                <i class="fa fa-stack-2x" :class="iconClasses(eventLogItem)"></i>
                <i v-if="eventLogItem.severity === 'error' || eventLogItem.category === 'MessageRedirects'" class="fa fa-o fa-stack-1x fa-inverse" :class="iconSubClasses(eventLogItem)"></i>
              </span>
            </div>

            <div class="col-9">
              <div class="row box-header">
                <div class="col-12">
                  <p class="lead">{{ eventLogItem.description }}</p>
                </div>
              </div>
            </div>

            <div class="col-2">
              <div>
                <time-since :dateUtc="eventLogItem.raised_at"></time-since>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row text-center">
        <div class="col-12">
          <a v-if="eventCount > 10" class="btn btn-default btn-secondary btn-all-events" href="/a/#/events">View all events</a>
        </div>
      </div>
    </div>
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
