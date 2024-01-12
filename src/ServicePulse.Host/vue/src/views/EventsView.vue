<script setup>
import { ref, onMounted } from "vue";
import { licenseStatus } from "../composables/serviceLicense";
import { useGetEventLogItems } from "../composables/serviceEventLogItems";
import TimeSince from "../components/TimeSince.vue";
import LicenseExpired from "../components/LicenseExpired.vue";
import AutoRefresh from "../components/AutoRefresh.vue";

const eventLogItems = ref([]);
const eventLogItemsPerPage = ref(25);

async function getEventLogItems() {
  const result = await useGetEventLogItems();
  eventLogItems.value = result;
}

onMounted(() => {
  getEventLogItems();
});

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
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <auto-refresh @tick="getEventLogItems" :isActive="true" :interval="5000"></auto-refresh>
    <div class="events events-view">
      <div class="row">
        <div class="col-sm-12">
          <h1>Events</h1>

          <div class="row box box-event-item" v-for="eventLogItem in eventLogItems" v-bind:key="eventLogItem.id" @click="navigateToEvent(eventLogItem)">
            <div class="col-x2-12">
              <div class="row events-list">
                <div class="col-icon">
                  <span class="fa-stack fa-lg">
                    <i
                      title="{{ eventLogItem.category }}"
                      class="fa fa-stack-2x"
                      v-bind:class="{
                        normal: eventLogItem.severity === 'info',
                        danger: eventLogItem.severity === 'error',
                        'fa-heartbeat': eventLogItem.category === 'Endpoints' || eventLogItem.category === 'EndpointControl' || eventLogItem.category === 'HeartbeatMonitoring',
                        'fa-check': eventLogItem.category === 'CustomChecks',
                        'fa-envelope': eventLogItem.category === 'MessageFailures' || eventLogItem.category === 'Recoverability',
                        'pa-redirect-source pa-redirect-large': eventLogItem.category === 'MessageRedirects',
                        'fa-exclamation': eventLogItem.category === 'ExternalIntegrations',
                      }"
                    ></i>

                    <i
                      v-show="eventLogItem.severity === 'error' || eventLogItem.category === 'MessageRedirects'"
                      class="fa fa-o fa-stack-1x fa-inverse"
                      v-bind:class="{
                        'fa-times fa-error': eventLogItem.severity === 'error',
                        'fa-pencil': eventLogItem.category === 'MessageRedirects' && eventLogItem.event_type === 'MessageRedirectChanged',
                        'fa-plus': eventLogItem.category === 'MessageRedirects' && eventLogItem.event_type === 'MessageRedirectCreated',
                        'fa-trash': eventLogItem.category === 'MessageRedirects' && eventLogItem.event_type === 'MessageRedirectRemoved',
                      }"
                    ></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-message">
              <div class="row box-header">
                <div class="col-sm-12">
                  <p class="lead">
                    {{ eventLogItem.description }}
                  </p>
                </div>
              </div>
            </div>
            <div class="col-timestamp">
              <time-since :date-utc="eventLogItem.raised_at"></time-since>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="pagination col-md-2">
            <label class="control-label">Items Per Page:</label>
            <button type="button" class="btn btn-default dropdown-toggle sp=btn-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <!-- TODO: Wire up items per page -->
              {{ eventLogItemsPerPage }}
              <span class="caret"></span>
            </button>
            <ul class="dropdown-menu">
              <li><a href="#">20</a></li>
              <li><a href="#">35</a></li>
              <li><a href="#">50</a></li>
              <li><a href="#">75</a></li>
            </ul>
          </div>

          <!-- TODO: Pagination control -->
        </div>
      </div>
    </div>
  </template>
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
</style>
