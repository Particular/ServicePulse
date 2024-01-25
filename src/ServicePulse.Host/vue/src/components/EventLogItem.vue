<script setup>
import { useRouter } from "vue-router";
import TimeSince from "../components/TimeSince.vue";

const props = defineProps({
  eventLogItem: Object,
});
const router = useRouter();

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
</script>

<template>
  <div class="row box box-event-item">
    <div class="col-12" @click.native="navigateToEvent(eventLogItem)">
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
              <p class="lead">
                {{ eventLogItem.description }}
              </p>
            </div>
          </div>
        </div>
        <div class="col-2">
          <time-since :date-utc="eventLogItem.raised_at"></time-since>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* TODO: Fix up styles */

.fa-stack-2x {
  font-size: 24px;
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

.events-view {
  margin-top: 0;
}

.row.box-event-item,
.row.box-event-item .col-xs-12 {
  padding-top: 8px;
  padding-bottom: 5px;
  width: 100%;
}

.events-list {
  display: table;
  width: 100%;
}

.events-list .col-icon {
  display: table-cell;
  width: 80px;
  vertical-align: middle;
}

.events-list .col-message {
  display: table-cell;
  width: auto;
  vertical-align: middle;
}

.events-list .col-icon .fa-stack {
  top: -8px;
}

.events-list .col-message p.lead {
  padding-bottom: 2px;
}

.events-list .col-timestamp {
  display: table-cell;
  width: 200px;
  vertical-align: middle;
}

.events-list .col-timestamp {
  padding-top: 0;
  padding-bottom: 4px;
}

.box-event-item {
  padding-top: 12px;
  padding-bottom: 12px;
}

.box-event-item .fa-stack {
  height: 1em;
}

ul.dropdown-menu li a span {
  color: #aaa;
}

.btn.sp-btn-menu:active,
.btn-default.sp-btn-menu:active,
.btn-default.sp-btn-menu.active,
.open > .dropdown-toggle.btn-default.sp-btn-menu {
  background: none;
  border: none;
  color: #00a3c4;
  text-decoration: underline;
  -webkit-box-shadow: none;
  box-shadow: none;
}
</style>
