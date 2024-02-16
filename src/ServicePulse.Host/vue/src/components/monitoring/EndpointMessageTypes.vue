<script setup>
import { computed } from "vue";
import { formatGraphDecimal, formatGraphDuration, smallGraphsMinimumYAxis } from "./formatGraph";

import NoData from "@/components/NoData.vue";
import SmallGraph from "./SmallGraph.vue";
import PaginationStrip from "@/components/PaginationStrip.vue";

const endpoint = defineModel({});

const paginatedMessageTypes = computed(() => {
  return endpoint.value.messageTypes.slice((endpoint.value.messageTypesPage - 1) * endpoint.value.messageTypesItemsPerPage, endpoint.value.messageTypesPage * endpoint.value.messageTypesItemsPerPage);
});

const emit = defineEmits(["refreshMessageTypes"]);
</script>

<template>
  <div class="row">
    <div class="col-xs-12 no-side-padding">
      <div v-if="endpoint.messageTypesAvailable" class="alert alert-warning endpoint-data-changed">
        <i class="fa fa-warning"></i> <strong>Warning:</strong> The number of available message types has changed.
        <a @click="emit('refreshMessageTypes')" class="alink">Click here to reload the view</a>
      </div>

      <!-- Breakdown by message type-->
      <!--headers-->
      <div class="row box box-no-click table-head-row">
        <div class="col-xs-4 col-xl-8">
          <div class="row box-header">
            <div class="col-xs-12">Message type name</div>
          </div>
        </div>
        <div class="col-xs-2 col-xl-1 no-side-padding">
          <div class="row box-header">
            <div class="col-xs-12 no-side-padding" v-tooltip :title="`Throughput: The number of messages per second successfully processed by a receiving endpoint.`">Throughput <span class="table-header-unit">(msgs/s)</span></div>
          </div>
        </div>
        <div class="col-xs-2 col-xl-1 no-side-padding">
          <div class="row box-header">
            <div class="col-xs-12 no-side-padding" v-tooltip :title="`Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed).`">Scheduled retries <span class="table-header-unit">(msgs/s)</span></div>
          </div>
        </div>
        <div class="col-xs-2 col-xl-1 no-side-padding">
          <div class="row box-header">
            <div class="col-xs-12 no-side-padding" v-tooltip :title="`Processing time: The time taken for a receiving endpoint to successfully process a message.`">Processing Time <span class="table-header-unit">(t)</span></div>
          </div>
        </div>
        <div class="col-xs-2 col-xl-1 no-side-padding">
          <div class="row box-header">
            <div class="col-xs-12 no-side-padding" v-tooltip :title="`Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint.`">
              Critical Time <span class="table-header-unit">(t)</span>
            </div>
          </div>
        </div>
      </div>

      <no-data v-if="endpoint.messageTypes.length == 0" message="No messages processed in this period of time."></no-data>

      <div class="row">
        <div class="col-xs-12 no-side-padding">
          <div
            class="row box endpoint-row"
            v-for="(messageType, id) in paginatedMessageTypes"
            :key="id"
            ng-repeat="messageType in endpoint.messageTypes | orderBy: 'typeName' | limitTo: endpoint.messageTypesItemsPerPage : (endpoint.messageTypesPage-1) * endpoint.messageTypesItemsPerPage"
          >
            <div class="col-xs-12 no-side-padding">
              <div class="row">
                <div class="col-xs-4 col-xl-8 endpoint-name" uib-tooltip-html="messageType.tooltipText">
                  <div class="row box-header">
                    <div class="col-lg-max-9 no-side-padding lead message-type-label righ-side-ellipsis">
                      <div class="lead">
                        {{ messageType.shortName ? messageType.shortName : "Unknown" }}
                      </div>
                    </div>
                    <div class="col-lg-4 no-side-padding endpoint-status message-type-status">
                      <span class="warning" v-if="messageType.metrics != null && formatGraphDuration(messageType.metrics.criticalTime).value < 0">
                        <i class="fa pa-warning" v-tooltip :title="`Warning: message type currently has negative critical time, possibly because of a clock drift.`"></i>
                      </span>
                      <span class="warning" v-if="endpoint.isScMonitoringDisconnected">
                        <i class="fa pa-monitoring-lost endpoint-details" v-tooltip :title="`Unable to connect to monitoring server`"></i>
                      </span>
                    </div>
                  </div>
                  <div class="row message-type-properties">
                    <div v-if="messageType.typeName && messageType.typeName != 'null' && !messageType.containsTypeHierarchy" class="message-type-part">
                      {{ messageType.assemblyName + "-" + messageType.assemblyVersion }}
                    </div>
                    <div class="message-type-part" v-for="(type, id) in messageType.messageTypeHierarchy" :key="id">
                      <span v-if="messageType.typeName && messageType.typeName != 'null' && messageType.containsTypeHierarchy"> {{ type.assemblyName + "-" + type.assemblyVersion }}</span>
                    </div>
                    <div v-if="messageType.culture && messageType.culture != 'null'" class="message-type-part">{{ "Culture=" + messageType.culture }}</div>
                    <div v-if="messageType.publicKeyToken && messageType.publicKeyToken != 'null'" class="message-type-part">{{ "PublicKeyToken=" + messageType.publicKeyToken }}</div>
                  </div>
                </div>
                <div class="col-xs-2 col-xl-1 no-side-padding">
                  <div class="row box-header">
                    <div class="no-side-padding">
                      <SmallGraph :type="'throughput'" :isdurationgraph="false" :plotdata="messageType.metrics.throughput" :minimumyaxis="smallGraphsMinimumYAxis.throughput" :metricsuffix="'MSGS/S'" />
                      <span class="no-side-padding sparkline-value">
                        {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDecimal(messageType.metrics.throughput, 2) }}
                        <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip :title="`No metrics received or endpoint is not configured to send metrics`">?</strong>
                        <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip :title="`Unable to connect to monitoring server`">?</strong>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="col-xs-2 col-xl-1 no-side-padding">
                  <div class="row box-header">
                    <div class="no-side-padding">
                      <SmallGraph :type="'retries'" :isdurationgraph="false" :plotdata="messageType.metrics.retries" :minimumyaxis="smallGraphsMinimumYAxis.retries" :metricsuffix="'MSGS/S'" />
                      <span class="no-side-padding sparkline-value">
                        {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDecimal(messageType.metrics.retries, 2) }}
                        <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip :title="`No metrics received or endpoint is not configured to send metrics`">?</strong>
                        <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip :title="`Unable to connect to monitoring server`">?</strong>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="col-xs-2 col-xl-1 no-side-padding">
                  <div class="row box-header">
                    <div class="no-side-padding">
                      <SmallGraph :type="'processing-time'" :isdurationgraph="true" :plotdata="messageType.metrics.processingTime" :minimumyaxis="smallGraphsMinimumYAxis.processingTime" />
                      <span class="no-side-padding sparkline-value">
                        {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDuration(messageType.metrics.processingTime).value }}
                        <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip :title="`No metrics received or endpoint is not configured to send metrics`">?</strong>
                        <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip :title="`Unable to connect to monitoring server`">?</strong>
                        <span v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected" class="unit">
                          {{ formatGraphDuration(messageType.metrics.processingTime).unit }}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="col-xs-2 col-xl-1 no-side-padding">
                  <div class="row box-header">
                    <div class="no-side-padding">
                      <SmallGraph :type="'critical-time'" :isdurationgraph="true" :plotdata="messageType.metrics.criticalTime" :minimumyaxis="smallGraphsMinimumYAxis.criticalTime" />
                      <span class="no-side-padding sparkline-value" :class="{ negative: formatGraphDuration(messageType.metrics.criticalTime).value < 0 }">
                        {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDuration(messageType.metrics.criticalTime).value }}
                        <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip :title="`No metrics received or endpoint is not configured to send metrics`">?</strong>
                        <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip :title="`Unable to connect to monitoring server`">?</strong>
                        <span v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected" class="unit">
                          {{ formatGraphDuration(messageType.metrics.criticalTime).unit }}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PaginationStrip v-model="endpoint.messageTypesPage" :itemsPerPage="endpoint.messageTypesItemsPerPage" :totalCount="endpoint.messageTypesTotalItems" />
    </div>
  </div>
</template>

<style scoped>
@import "@/components/list.css";
@import "./endpoint.css";

.endpoint-row {
  padding: 0.5em 1.5em;
  margin: 0;
}

.box {
  box-shadow: none;
  margin: 0;
}
</style>
