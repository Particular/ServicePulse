<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getEventLogItems } from "../composables/eventLogItems.js";
import TimeSince from "./TimeSince.vue";

const router = useRouter();
const eventLogItems = ref([]);
const eventCount = ref(0);
onMounted(() => {
  getEventLogItems().then((data) => {
    eventCount.value = data.length;
    eventLogItems.value = data.slice(0, 10);
  });
});

function iconClasses(eventItem) {
  return {
    normal: eventItem.severity === "info",
    danger: eventItem.severity === "error",
    "fa-heartbeat":
      eventItem.category === "Endpoints" ||
      eventItem.category === "EndpointControl" ||
      eventItem.category === "HeartbeatMonitoring",
    "fa-check": eventItem.category === "CustomChecks",
    "fa-envelope":
      eventItem.category === "MessageFailures" ||
      eventItem.category === "Recoverability",
    "pa-redirect-source pa-redirect-large":
      eventItem.category === "MessageRedirects",
    "fa-exclamation": eventItem.category === "ExternalIntegrations",
  };
}

function iconSubClasses(eventItem) {
  return {
    "fa-times fa-error":
      (eventItem.severity === "error" ||
        eventItem.category === "MessageRedirects") &&
      eventItem.severity === "error",
    "fa-pencil":
      (eventItem.severity === "error" ||
        eventItem.category === "MessageRedirects") &&
      eventItem.category === "MessageRedirects" &&
      eventItem.event_type === "MessageRedirectChanged",
    "fa-plus":
      (eventItem.severity === "error" ||
        eventItem.category === "MessageRedirects") &&
      eventItem.category === "MessageRedirects" &&
      eventItem.event_type === "MessageRedirectCreated",
    "fa-trash":
      (eventItem.severity === "error" ||
        eventItem.category === "MessageRedirects") &&
      eventItem.category === "MessageRedirects" &&
      eventItem.event_type === "MessageRedirectRemoved",
  };
}

function navigateToEvent(eventLogItem) {
  switch (eventLogItem.category) {
    case "Endpoints":
      router.push("/configuration#endpoints");
      break;
    case "HeartbeatMonitoring":
      //router.push('/a/#/endpoints');
      window.location = "/a/#/endpoints";
      break;
    case "CustomChecks":
      //router.push('/a/#/custom-checks');
      window.location = "/a/#/custom-checks";
      break;
    case "EndpointControl":
      //router.push('/a/#/endpoints');
      window.location = "/a/#/endpoints";
      break;
    case "MessageFailures":
      var newlocation = "/a/#/failed-messages/groups";
      if (
        eventLogItem.related_to &&
        eventLogItem.related_to[0].search("message") > 0
      ) {
        newlocation = "/a/#/failed-messages" + eventLogItem.related_to[0];
      }
      //router.push(newlocation);
      window.location = newlocation;
      break;
    case "Recoverability":
      //router.push('/a/#/failed-messages/groups');
      window.location = "/a/#/failed-messages/groups";
      break;
    case "MessageRedirects":
      router.push("/configuration#redirects");
      break;
    default:
  }
}
</script>

<template>
  <div class="row events">
    <div class="col-sm-12">
      <h6>Last 10 events</h6>

      <div
        class="row box box-event-item"
        v-for="eventLogItem in eventLogItems"
        :key="eventLogItem.id"
      >
        <div class="col-xs-12" @click="navigateToEvent(eventLogItem)">
          <div class="row">
            <div class="col-xs-1">
              <span class="fa-stack fa-lg">
                <i
                  class="fa fa-stack-2x"
                  :class="iconClasses(eventLogItem)"
                ></i>
                <i
                  v-if="
                    eventLogItem.severity === 'error' ||
                    eventLogItem.category === 'MessageRedirects'
                  "
                  class="fa fa-o fa-stack-1x fa-inverse"
                  :class="iconSubClasses(eventLogItem)"
                ></i>
              </span>
            </div>

            <div class="col-xs-9">
              <div class="row box-header">
                <div class="col-sm-12">
                  <p class="lead">{{ eventLogItem.description }}</p>
                </div>
              </div>
            </div>

            <div class="col-xs-2">
              <div>
                <time-since :dateUtc="eventLogItem.raised_at"></time-since>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row text-center">
        <a
          v-if="eventCount > 10"
          class="btn btn-default btn-secondary btn-all-events"
          href="/events"
          >View all events</a
        >
      </div>
    </div>
  </div>
</template>
