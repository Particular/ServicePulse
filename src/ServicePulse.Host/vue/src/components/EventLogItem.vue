<script setup>
import { useRouter } from "vue-router";
import TimeSince from "../components/TimeSince.vue";

defineProps({
  eventLogItem: Object,
});
const router = useRouter();

function navigateToEvent(eventLogItem) {
  switch (eventLogItem.category) {
    case "Endpoints":
      router.push({ name: "endpoint-connection" });
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
      if (eventLogItem.related_to?.length && eventLogItem.related_to[0].search("message") > 0) {
        const messageId = eventLogItem.related_to[0].substring(9);
        router.push({ name: "message", params: { id: messageId } });
      } else {
        router.push({ name: "failed-messages" });
      }
      break;
    case "Recoverability":
      router.push({ name: "failed-messages" });
      break;
    case "MessageRedirects":
      router.push({ name: "retry-redirects" });
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
    <div class="col-12" @click="navigateToEvent(eventLogItem)">
      <div class="row">
        <div class="col-1">
          <span class="fa-stack fa-lg">
            <i class="fa fa-stack-2x" :class="iconClasses(eventLogItem)" />
            <i v-if="eventLogItem.severity === 'error' || eventLogItem.category === 'MessageRedirects'" class="fa fa-o fa-stack-1x fa-inverse" :class="iconSubClasses(eventLogItem)" />
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

<style scoped>
.fa-stack-2x {
  font-size: 1.5em;
}

.box {
  padding-bottom: 0;
}

.box:hover {
  cursor: pointer;
  background-color: #edf6f7;
  border: 1px solid #00a3c4;
}

p.lead {
  word-wrap: break-word;
  color: #181919 !important;
  font-size: 1em !important;
  font-weight: bold !important;
  margin-bottom: 0.2em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row.box-event-item,
.row.box-event-item .col-xs-12,
.row.box.box-event-item .col-12 {
  padding-top: 0.5em;
  padding-bottom: 0.3em;
  width: 100%;
}

.col-icon {
  display: table-cell;
  width: 5em;
  vertical-align: middle;
}

.col-message {
  display: table-cell;
  width: auto;
  vertical-align: middle;
}

.col-icon .fa-stack {
  top: -0.5em;
}

.col-message p.lead {
  padding-bottom: 0.125em;
}

.col-timestamp {
  display: table-cell;
  width: 8em;
  vertical-align: middle;
  padding-top: 0;
  padding-bottom: 0.125em;
}

.box-event-item {
  padding-top: 0.75em;
  padding-bottom: 0.75em;
}

.box {
  box-shadow: none;
  margin: 0 !important;
  padding-bottom: 0.625em;
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
