<script setup>

    import { ref, onMounted, onUnmounted } from "vue";
    import { useRouter } from "vue-router";
    import { stats } from "../../composables/serviceServiceControl.js";
    import { useShowToast } from "../../composables/toast.js";
    import { useFetchFromMonitoring, useIsMonitoringDisabled } from "../../composables/serviceServiceControlUrls";
    import MonitoringNoData from "./MonitoringNoData.vue";
    import MonitoringNotAvailable from "./MonitoringNotAvailable.vue";
    import { useGetExceptionGroups } from "../../composables/serviceMessageGroup.js";
    import {  monitoringConnectionState } from "../../composables/serviceServiceControl";
    import { useFormatTime, useFormatLargeNumber } from "../../composables/formatter.js";

    const endpoints = ref([]);
    const exceptionGroups = ref([]);
    const historyPeriod = 1;
    const router = useRouter();
    var hasData = ref(false);
    var supportsEndpointCount = ref();
    const metricslargenumber = ref();
    var monitoringNotAvailable = ref(false);
    const smallGraphsMinimumYAxis = { queueLength: 10, throughput: 10, retries: 10, processingTime: 10, criticalTime: 10, };

    function getAllMonitoredEndpoints() {
        if (!useIsMonitoringDisabled() && !monitoringConnectionState.unableToConnect) {
            return useFetchFromMonitoring(`${`monitored-endpoints`}?history=${historyPeriod}`)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    endpoints.value = [];
                    endpoints.value = data;
                    updateUI();
                    getEndpointsFromScSubscription();
                });
        }
        else { getEndpointsFromScSubscription();  }

    }

    function getEndpointsFromScSubscription() {
        return useGetExceptionGroups('Endpoint Name').then((result) => {
            exceptionGroups.value = [];
            exceptionGroups.value = result;
            //Squash and add to existing monitored endpoints

            if (exceptionGroups.value.length > 0) {
                //sort the exceptiongroup list by name - case sensitive
                exceptionGroups.value.sort((a, b) => (a.title > b.title ? 1 : a.title < b.title ? -1 : 0))//desc
                exceptionGroups.value.forEach((failedMessageEndpoint) => {
                    if (failedMessageEndpoint.operation_status === 'ArchiveCompleted') {
                        return;
                    }
                    var index = endpoints.value.findIndex(function (item) { return item.name === failedMessageEndpoint.title });
                    if (index >= 0) {
                        endpoints.value[index].serviceControlId = failedMessageEndpoint.id;
                        endpoints.value[index].errorCount = failedMessageEndpoint.count;
                    } else {
                        endpoints.value.push({ name: failedMessageEndpoint.title, errorCount: failedMessageEndpoint.count, serviceControlId: failedMessageEndpoint.id, isScMonitoringDisconnected: true });
                    }
                });
            }


        });
    }

    function updateUI() {
        if (endpoints.value.length > 0) {
            endpoints.value.forEach((endpoint) => {
                hasData = !endpoint.empty;
                supportsEndpointCount.value = Object.prototype.hasOwnProperty.call(endpoint, 'connectedCount');
                if (endpoint.empty) {
                    return;
                }

                if (endpoint.error) {
                    // connectivityNotifier.reportFailedConnection();
                    if (endpoints.value) {
                        endpoints.value.forEach((item) => item.isScMonitoringDisconnected = true);
                    }
                } else {
                    // connectivityNotifier.reportSuccessfulConnection();
                    var index = endpoints.value.findIndex(function (item) { return item.name === endpoint.name; });
                    endpoint.isScMonitoringDisconnected = false;
                    if (index >= 0) {
                        mergeIn(endpoints.value[index], endpoint);
                    } else {
                        endpoints.value.push(endpoint);
                    }
                }

            });

            //sort the monitored endpoints by name - case sensitive
            endpoints.value.sort((a, b) => (a.name < b.name ? 1 : a.name > b.name ? -1 : 0))

        }
    }


    function navigateToMessageGroup($event, groupId) {
        if ($event.target.localName !== "button") {
            router.push({ name: "message-groups", params: { groupId: groupId } });
        }
    }
    function navigateToEndpointDetails($event, endpointName) {
        if ($event.target.localName !== "button") {
            //to do historyPeriod
            router.push({ name: "endpoint-details", params: { name: endpointName }, query: { historyPeriod: historyPeriod } });
        }
    }

    function formatGraphDuration(input) {

        if (input) {
            var lastValue = input.points.length > 0 ? input.points[input.points.length - 1] : 0;
            var formatLastValue = useFormatTime(lastValue);
            return formatLastValue;
        }
        return input;
    }
    function formatGraphDecimal(input, deci) {
        if (input) {
            var lastValue = input.points.length > 0 ? input.points[input.points.length - 1] : 0;
            var decimals = 0;
            if (lastValue < 10 || input > 1000000) {
                decimals = 2;
            }
            return useFormatLargeNumber(lastValue, deci || decimals);
        } else {
            input = {
                points: [],
                average: 0,
                displayValue: 0
            };
        }


    }

    function mergeIn(destination, source) {
        for (var propName in source) {
            if (Object.prototype.hasOwnProperty.call(source, propName)) {
                destination[propName] = source[propName];
            }

        }
    }
    onMounted(() => {
        getAllMonitoredEndpoints();
    });
</script>


<template>
    <section ng-if="grouping.selectedGrouping == 0">
        <div class="row">
            <div class="col-sm-12">
                <MonitoringNoData v-if="!endpoints && endpoints.length === 0 && !hasData  "></MonitoringNoData>
            </div>
        </div>

        <div class="row">
            <div class="col-sm-12">
                <MonitoringNotAvailable  v-if="!endpoints && endpoints.length === 0 && hasData"></MonitoringNotAvailable>
            </div>
        </div>

        <!--Table headings-->
        <div v-if="endpoints && endpoints.length >0" class="row box box-no-click table-head-row">
            <div class="col-xs-2 col-xl-7">
                <sortable-column property="'name'" ref="order">
                    Endpoint name
                </sortable-column>
            </div>
            <div class="col-xs-2 col-xl-1 no-side-padding">
                <sortable-column property="'metrics.queueLength.average'"
                                 ref="order"
                                 title="Queue length: The number of messages waiting to be processed in the input queue(s) of the endpoint.">
                    Queue Length <span class="table-header-unit">(msgs)</span>
                </sortable-column>
            </div>
            <div class="col-xs-2 col-xl-1 no-side-padding">
                <sortable-column property="'metrics.throughput.average'"
                                 ref="order"
                                 title="Throughput: The number of messages per second successfully processed by a receiving endpoint.">
                    Throughput <span class="table-header-unit">(msgs/s)</span>
                </sortable-column>
            </div>
            <div class="col-xs-2 col-xl-1 no-side-padding">
                <sortable-column property="'metrics.retries.average'"
                                 ref="order"
                                 title="Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed).">
                    Scheduled retries <span class="table-header-unit">(msgs/s)</span>
                </sortable-column>
            </div>
            <div class="col-xs-2 col-xl-1 no-side-padding">
                <sortable-column property="'metrics.processingTime.average'"
                                 ref="order"
                                 title="Processing time: The time taken for a receiving endpoint to successfully process a message.">
                    Processing Time <span class="table-header-unit">(t)</span>
                </sortable-column>
            </div>
            <div class="col-xs-2 col-xl-1 no-side-padding">
                <sortable-column property="'metrics.criticalTime.average'"
                                 ref="order"
                                 title="Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint.">
                    Critical Time <span class="table-header-unit">(t)</span>
                </sortable-column>
            </div>
        </div>

        <!--endpointlist-->
        <div class="row" v-if="endpoints && endpoints.length >0" >
            <div class="col-xs-12 no-side-padding">
                <div class="row box endpoint-row" v-for="(endpoint, index) in endpoints" :key="index" v-show="endpoints.length" v-on:mouseenter="endpoint.hover1=true" v-on:mouseleave="endpoint.hover1=false">
                    <div class="col-xs-12 no-side-padding">
                        <div class="row">
                            <!--EndpointName-->
                            <div class="col-xs-2 col-xl-7 endpoint-name name-overview">
                                <div class="row box-header">
                                    <div class="col-lg-max-3 no-side-padding lead righ-side-ellipsis endpoint-details-link">
                                        <a @click="navigateToEndpointDetails($event, endpoint.name)" class="cursorpointer" :title="`${endpoint.name}`">
                                            {{endpoint.name}}
                                        </a>
                                    </div>
                                    <span class="endpoint-count ng-binding ng-scope" v-if="endpoint.connectedCount || endpoint.disconnectedCount" :title="`Endpoint instance(s): ${endpoint.connectedCount || 0} `">({{endpoint.connectedCount || 0}})</span>
                                    <div class="col-xs-5 no-side-padding endpoint-status">
                                        <span class="warning" ng-if="endpoint.metrics.criticalTime.displayValue < 0">
                                            <i class="fa pa-warning" :title="`Warning: endpoint currently has negative critical time, possibly because of a clock drift.`"></i>
                                        </span>
                                        <span class="warning" v-if="endpoint.isScMonitoringDisconnected">
                                            <i class="fa pa-monitoring-lost endpoints-overview" :title="`Unable to connect to monitoring server`"></i>
                                        </span>
                                        <span class="warning" v-if="endpoint.isStale && (!supportsEndpointCount.value || !endpoint.connectedCount)" :title="`No data received from any instance`">
                                            <a class="monitoring-lost-link" ng-href="{{getDetailsUrl(endpoint)}}&tab=instancesBreakdown"><i class="fa pa-endpoint-lost endpoints-overview"></i></a>
                                        </span>
                                        <span class="warning" v-if="endpoint.errorCount" :title="`${endpoint.errorCount | metricslargenumber} failed messages associated with this endpoint. Click to see list.`">
                                            <a v-if="endpoint.errorCount" class="warning  cursorpointer" @click="navigateToMessageGroup($event, endpoint.serviceControlId)">
                                                <i class="fa fa-envelope"></i>
                                                <span class="badge badge-important ng-binding cursorpointer ">{{endpoint.errorCount}}</span>
                                                <!--<span class="badge badge-important ng-binding cursorpointer ">endpoint.errorCount | metricslargenumber}}</span>-->
                                            </a>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!--Queue Length-->
                            <div class="col-xs-2 col-xl-1 no-side-padding">
                                <div class="row box-header">
                                    <div class="no-side-padding">
                                        <graph plot-data="endpoint.metrics.queueLength" minimum-YAxis="{{smallGraphsMinimumYAxis.queueLength}}" avg-label-color="#EA7E00" metric-suffix="MSGS" class="graph queue-length pull-left"></graph>
                                    </div>
                                    <div class="no-side-padding sparkline-value">
                                        {{(endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : formatGraphDecimal(endpoint.metrics.queueLength, 0)}}
                                        <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" uib-tooltip="No metrics received or endpoint is not configured to send metrics">?</strong>
                                        <strong v-if="endpoint.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                    </div>
                                </div>
                            </div>
                            <!--Throughput-->
                            <div class="col-xs-2 col-xl-1 no-side-padding">
                                <div class="row box-header">
                                    <div class="no-side-padding">
                                        <graph plot-data="endpoint.metrics.throughput" minimum-YAxis="{{smallGraphsMinimumYAxis.throughput}}" avg-label-color="#176397" metric-suffix="MSGS/S" class="graph throughput pull-left"></graph>
                                    </div>
                                    <div class="no-side-padding sparkline-value">
                                        {{(endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : formatGraphDecimal(endpoint.metrics.throughput, 2)}}
                                        <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" uib-tooltip="No metrics received or endpoint is not configured to send metrics">?</strong>
                                        <strong v-if="endpoint.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                    </div>
                                </div>
                            </div>
                            <!--Scheduled Retries-->
                            <div class="col-xs-2 col-xl-1 no-side-padding">
                                <div class="row box-header">
                                    <div class="no-side-padding">
                                        <graph plot-data="endpoint.metrics.retries" minimum-YAxis="{{smallGraphsMinimumYAxis.retries}}" avg-label-color="#CC1252" metric-suffix="MSGS/S" class="graph retries pull-left"></graph>
                                    </div>
                                    <div class="no-side-padding sparkline-value">
                                        {{(endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : formatGraphDecimal(endpoint.metrics.retries, 2)}}
                                        <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" uib-tooltip="No metrics received or endpoint is not configured to send metrics">?</strong>
                                        <strong v-if="endpoint.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                    </div>
                                </div>
                            </div>
                            <!--Processing Time-->
                            <div class="col-xs-2 col-xl-1 no-side-padding">
                                <div class="row box-header">
                                    <div class="no-side-padding">
                                        <graph plot-data="endpoint.metrics.processingTime" minimum-YAxis="{{smallGraphsMinimumYAxis.processingTime}}" avg-label-color="#258135" is-duration-graph="true" class="graph processing-time pull-left"></graph>
                                    </div>
                                    <div class="no-side-padding sparkline-value" ng-class="endpoint.metrics.processingTime.displayValue.unit">
                                        {{(endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : formatGraphDuration(endpoint.metrics.processingTime).value}}
                                        <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" uib-tooltip="No metrics received or endpoint is not configured to send metrics">?</strong>
                                        <strong v-if="endpoint.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                        <span v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false"> {{formatGraphDuration(endpoint.metrics.processingTime).unit}}</span>
                                    </div>
                                </div>
                            </div>
                            <!--Critical Time-->
                            <div class="col-xs-2 col-xl-1 no-side-padding">
                                <div class="row box-header">
                                    <div class="no-side-padding">
                                        <graph plot-data="endpoint.metrics.criticalTime" minimum-YAxis="{{smallGraphsMinimumYAxis.criticalTime}}" avg-label-color="#2700CB" is-duration-graph="true" class="graph critical-time pull-left"></graph>
                                    </div>
                                    <div class="no-side-padding sparkline-value" ng-class="[endpoint.metrics.criticalTime.displayValue.unit, {'negative':endpoint.metrics.criticalTime.displayValue.value < 0}]">
                                        {{(endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : formatGraphDuration(endpoint.metrics.criticalTime).value}}
                                        <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" title="No metrics received or endpoint is not configured to send metrics">?</strong>
                                        <strong v-if="endpoint.isScMonitoringDisconnected" title="Unable to connect to monitoring server">?</strong>
                                        <span v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="unit"> {{formatGraphDuration(endpoint.metrics.criticalTime).unit}}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>

    </section>
</template>


<style>

.cursorpointer {
cursor: pointer;
}
.endpoint-row {
height: 61px; /*//61*/
position: relative;
padding: 2px 0 4px;
}
.endpoint-name {
margin-top: 15px;
}

.endpoint-name > div > div > a {
text-overflow: ellipsis;
overflow: hidden;
white-space: nowrap;
color: #00729C;
border-bottom: 1px dotted lightgrey;
}

.endpoint-name > div > div > a:first-child:hover {
border-bottom: 1px solid #00729C;
text-decoration: none !important;
}

i.fa.pa-endpoint-lost.endpoints-overview, i.fa.pa-monitoring-lost.endpoints-overview {
position: relative;
margin-right: 4px;
}

i.fa.pa-endpoint-lost.endpoints-overview {
top: 8px;
}
.lead.righ-side-ellipsis.endpoint-details-link {
color: #00729C !important;
cursor: pointer;
}
.righ-side-ellipsis {
direction: rtl;
text-align: left;
}

@supports (-ms-ime-align:auto) {
.righ-side-ellipsis {
direction: ltr;
}
}
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
.righ-side-ellipsis {
direction: ltr;
}
}

.endpoint-count {
color: #777;
font-weight: normal;
margin-left: 3px;
}



.pa-monitoring-lost.endpoints-overview {
background-image: url('../../a/img/monitoring-lost.svg');
background-position: center;
background-repeat: no-repeat;
}


.pa-warning {
background-image: url('../../../a/img/warning.svg');
background-position: center;
background-repeat: no-repeat;
width: 20px;
height: 20px;
margin-left: 4px;
padding-top: 24px;
}

.warning {
color: red;
}

.warning i {
color: #BE0202;
}
.ng-binding {
margin-right: 4px !important;
}
.monitoring-lost-link i {
top: 7px;
}
.pa-endpoint-lost.endpoints-overview {
background-image: url('../../a/img/endpoint-lost.svg');
background-position: center;
background-repeat: no-repeat;
}
.endpoint-status {
display: inline-block;
position: absolute;
top: 1px;
margin-left: 7px;
padding-left: 0;
}

.endpoint-status i.fa-envelope, .endpoint-status i.fa-exclamation-triangle {
font-size: 20px;
color: #CE4844;
}

h1 .endpoint-status i.fa-envelope, .endpoint-status i.fa-exclamation-triangle {
font-size: 24px;
}

.endpoint-status i.fa-envelope {
color: #777f7f;
}

.endpoint-status i.fa-envelope:hover {
color: #23527c;
}

.endpoint-status .badge {
position: relative;
top: 8px;
font-size: 10px;
margin-right: 0;
left: -10px;
}

.endpoint-status i.fa-envelope, .endpoint-name i.fa-exclamation-triangle {
font-size: 20px;
margin-left: 6px;
}

.endpoint-status a {
position: relative;
top: -8px;
padding-left: 0;
}

.endpoint-status a:hover {
text-decoration: none;
}

.endpoint-status a[ng-if="endpoint.errorCount"] {
top: -11px;
}

.monitoring-head .endpoint-status {
top: 4px;
}

.monitoring-head .endpoint-status a {
top: 0;
}

.monitoring-head .endpoint-status a[ng-if="endpoint.errorCount"] {
top: -5px;
}

.monitoring-head .endpoint-status {
top: 4px;
}

.monitoring-head .endpoint-status a {
top: 0;
}

.monitoring-head .endpoint-status a[ng-if="endpoint.errorCount"] {
top: -5px;
}

.monitoring-head i.fa.fa-envelope {
font-size: 26px;
position: relative;
top: -4px;
left: 1px;
}

.monitoring-head .endpoint-status .badge {
position: relative;
top: 4px;
left: -12px;
font-size: 10px;
}

.endpoint-status .badge {
position: relative;
top: 2px;
left: -9px;
font-size: 10px;
}

.monitoring-head .endpoint-status .pa-endpoint-lost.endpoint-details, .monitoring-head .endpoint-status .pa-monitoring-lost.endpoint-details {
width: 32px;
height: 30px;
}

.endpoint-status .pa-endpoint-lost.endpoint-details, .endpoint-status .pa-monitoring-lost.endpoint-details, .endpoint-status .pa-endpoint-lost.endpoints-overview, .endpoint-status .pa-monitoring-lost.endpoints-overview {
width: 26px;
height: 26px;
left: 6px;
position: relative;
}

.endpoint-message-types .endpoint-status {
margin-top: -8px;
}
@media (min-width: 768px) {
.graph-values .col-sm-6 {
width: 45%;
}
}
.large-graphs {
width: 100%;
background-color: white;
margin-bottom: 34px;
padding: 30px 0;
}

.large-graph {
width: 100%;
}

.large-graph svg {
width: 100%
}

.graph {
width: 68%;
}

.graph svg {
position: relative;
width: 100%;
height: 50px;
}

.graph * .graph-data-line {
stroke-width: 1.75px;
fill: none;
}

.graph * .graph-data-fill {
opacity: 0.8;
}

.graph * .graph-avg-line {
stroke-width: 1px;
opacity: 0.5;
stroke-dasharray: 5,5;
}

.graph.queue-length * .graph-data-line {
stroke: #EA7E00;
}

.graph.queue-length * .graph-data-fill {
fill: #EADDCE;
stroke: #EADDCE;
}

.graph.queue-length * .graph-avg-line {
stroke: #EA7E00;
}

.graph.throughput * .graph-data-line {
stroke: #176397;
}

.graph.throughput * .graph-data-fill {
fill: #CADCE8;
stroke: #CADCE8;
}

.graph.throughput * .graph-avg-line {
stroke: #176397;
}

.graph.retries * .graph-data-line {
stroke: #CC1252;
}

.graph.retries * .graph-data-fill {
fill: #E9C4D1;
stroke: #E9C4D1;
}

.graph.retries * .graph-avg-line {
stroke: #CC1252;
}

.graph.processing-time * .graph-data-line {
stroke: #258135;
}

.graph.processing-time * .graph-data-fill {
fill: #BEE6C5;
stroke: #BEE6C5;
}

.graph.processing-time * .graph-avg-line {
stroke: #258135;
}

.graph.critical-time * .graph-data-line {
stroke: #2700CB;
}

.graph.critical-time * .graph-data-fill {
fill: #C4BCE5;
stroke: #C4BCE5;
}

.graph.critical-time * .graph-avg-line {
stroke: #2700CB;
}
.graph-area {
width: 33%;
box-sizing: border-box;
}

.graph-values {
margin-left: 60px;
padding-top: 10px;
border-top: 3px solid #fff;
margin-top: -8.5px;
width: 93%;
}

.graph-message-retries-throughputs, .graph-critical-processing-times {
margin-left: 0.5%;
}
.endpoint-row .graphicon {
top: 14px;
left: 120px;
position: absolute;
width: 94px;
padding-left: 36px;
display: block;
}

.endpoint-row .graphicon.graphicon-row-hover {
background-color: #edf6f7 !important;
}

.sparkline-value {
top: 16px;
left: -12px;
position: relative;
font-weight: normal;
float: right;
width: 25%;
}

.sparkline-value span {
color: #777f7f;
text-transform: uppercase;
font-size: 11px;
}


.sparkline-value.sec {
color: #0000FF;
}

.sparkline-value.sec span {
color: #007AFF;
}

.sparkline-value.min {
color: #8B00D0;
}

.sparkline-value.min span {
color: #B14AE4;
}

.sparkline-value.hr {
color: #D601DA;
}

.sparkline-value.hr span {
color: #D764D9;
}

.sparkline-value.d {
color: #AD0017;
}

.sparkline-value.d span {
color: #FF0004;
}
</style>
