<script setup>
// Composables
import { ref, computed,  onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { monitoringConnectionState, connectionState } from "../../composables/serviceServiceControl";
import { useFormatTime, useFormatLargeNumber } from "../../composables/formatter.js";
import { licenseStatus } from "../../composables/serviceLicense.js";
import { useRedirects } from "../../composables/serviceRedirects.js";
import { useFetchFromMonitoring, useIsMonitoringDisabled } from "../../composables/serviceServiceControlUrls";
import { useGetExceptionGroupsForEndpoint } from "../../composables/serviceMessageGroup.js";
// Components
import LicenseExpired from "../../components/LicenseExpired.vue";
import ServiceControlNotAvailable from "../../components/ServiceControlNotAvailable.vue";
import MonitoringNoData from "./MonitoringNoData.vue";
import MonitoringNotAvailable from "./MonitoringNotAvailable.vue";
import PeriodSelector from "./MonitoringHistroyPeriod.vue";
import NoData from "../NoData.vue";

let refreshInterval = undefined;

    const route = useRoute();
    const router = useRouter();
    const endpointName = route.params.endpointName;
    var showInstancesBreakdown = "instancesBreakdown";
    showInstancesBreakdown = computed(() => route.params.tab);
    var selectedHistoryPeriod = "1";
    var isLoading = true;
    var loadedSuccessfully = false;
    //$scope.largeGraphsMinimumYAxis = largeGraphsMinimumYAxis;
    //$scope.smallGraphsMinimumYAxis = smallGraphsMinimumYAxis;

    //$scope.periods = historyPeriodsService.getAllPeriods();
    //$scope.selectedPeriod = historyPeriodsService.getDefaultPeriod();

    //$scope.selectPeriod = function (period) {
    //    $scope.selectedPeriod = period;
    //    historyPeriodsService.saveSelectedPeriod(period);
    //    updateUI();
    //};
    const endpoint = ref({});
    var negativeCriticalTimeIsPresent = false;
    endpoint.value.messageTypesPage = !showInstancesBreakdown ? route.params.pageNo : 1;
    endpoint.value.messageTypesTotalItems = 0;
    endpoint.value.messageTypesItemsPerPage = 10
    endpoint.value.messageTypesAvailable = false;
    endpoint.value.messageTypesUpdatedSet = [];

    function getEndpointDetails() {
        if (!useIsMonitoringDisabled() && !monitoringConnectionState.unableToConnect) {
            return useFetchFromMonitoring(`${`monitored-endpoints`}/${endpointName}?history=${selectedHistoryPeriod}`)
                .then((response) => {
                    if (response.status === 404) {
                        endpoint.value = { notFound: true };
                    } else if (response.status !== 200) {
                        endpoint.value = { error: true };
                    }
                    return response.json();

                })
                .then((data) => {
                    filterOutSystemMessage(data);
                    var endpointDetails = data;
                    endpointDetails.isScMonitoringDisconnected = false;
                    endpointDetails.isStale = true;
                    Object.assign(endpoint.value, endpointDetails);
                    updateUI();
                })
                .catch((err) => {
                    console.log(err);
                    return { error: err };
                    return;
                });
        }
    }

    function updateUI() {

        isLoading = false;

        if (endpoint.error) {
            //connectivityNotifier.reportFailedConnection();
            if (endpoint && endpoint.instances) {
                endpoint.instances.forEach((item) => item.isScMonitoringDisconnected = true);
            }
            endpoint.isScMonitoringDisconnected = true;

        } else {

            if (endpoint.value.messageTypesTotalItems > 0 &&
                endpoint.value.messageTypesTotalItems !== endpoint.value.messageTypes.length) {

                mergeIn(endpoint, endpoint, ['messageTypes']);

                endpoint.messageTypesAvailable = true;
                endpoint.messageTypesUpdatedSet = endpoint.messageTypes;

            }
            else {
                mergeIn(endpoint, endpoint);
            }

            //connectivityNotifier.reportSuccessfulConnection();

            //sorting
            //endpoint.instances.sort(function (first, second) {
            //    if (first.id < second.id) {
            //        return -1;
            //    }

            //    if (first.id > second.id) {
            //        return 1;
            //    }

            //    return 0;
            //});

            processMessageTypes();

            endpoint.isStale = true;
            endpoint.isScMonitoringDisconnected = false;
            negativeCriticalTimeIsPresent = false;

            endpoint.value.instances.forEach(function (instance) {
                fillDisplayValues(instance);
                //get errror count by instance id
                useGetExceptionGroupsForEndpoint("Endpoint Instance", instance.id).then((result) => {
                    if (result && result.length > 0) {
                        instance.serviceControlId = result[0].id;
                        instance.errorCount = result[0].count;
                        instance.isScMonitoringDisconnected = false;
                    }
                });
                endpoint.isStale = endpoint.isStale && instance.isStale;
                //negativeCriticalTimeIsPresent |= instance.metrics.criticalTime.displayValue.value < 0;
            });

            loadedSuccessfully = true;
        }
            //get errror count by endpoint name
            useGetExceptionGroupsForEndpoint("Endpoint Name", endpointName).then((result) => {
                if (result.length > 0) {
                    endpoint.value.serviceControlId = result[0].id;
                    endpoint.value.errorCount = result[0].count;
                }
            });
    }


    function filterOutSystemMessage(data) {
        data.messageTypes = data.messageTypes.filter(mt => {
            return mt.id;
        });
    }

    function mergeIn(destination, source, propertiesToSkip) {
        for (var propName in source) {
            if (Object.prototype.hasOwnProperty.call(source, propName)) {
                if (!propertiesToSkip || !propertiesToSkip.includes(propName)) {
                    destination[propName] = source[propName];
                }
            }
        }
    }
    function IsShowInstancesBreakdownTab (isVisible) {
       showInstancesBreakdown = isVisible;

       refreshMessageTypes();
    };

    //function removeEndpoint (endpointName, instance) {
    //    instance.busy = true;
    //    //monitoringService.removeEndpointInstance(endpointName, instance.id).then(() => {
    //    //    $scope.endpoint.instances.splice($scope.endpoint.instances.indexOf(instance), 1);

    //    //    if ($scope.endpoint.instances.length === 0) {
    //    //        $window.location.hash = '#/monitoring';
    //    //    }
    //    //}, () => {
    //    //    instance.busy = false;
    //    //});
    //};
    //function isRemovingEndpointEnabled() {
    //    return $http({
    //        method: 'OPTIONS',
    //        url: mu
    //    }).then((response) => {
    //        const headers = response.headers();

    //        const allow = headers.allow;
    //        const deleteAllowed = allow.indexOf('DELETE') >= 0;

    //        return deleteAllowed;
    //    }, function () {
    //        return false;
    //    });
    //}

    //monitoringService.isRemovingEndpointEnabled().then(enabled => {
    //    $scope.isRemovingEndpointEnabled = enabled;
    //});
    function getDisconnectedCount() {

        return useFetchFromMonitoring(`${`monitored-endpoints`}/disconnected`)


    }

    function  refreshMessageTypes() {
        if (endpoint.messageTypesAvailable) {
            endpoint.messageTypesAvailable = false;

            endpoint.messageTypes = endpoint.messageTypesUpdatedSet;
            endpoint.messageTypesUpdatedSet = null;

            processMessageTypes();
        }
    }

    function processMessageTypes() {

       // endpoint.messageTypesTotalItems = endpoint.messageTypes.length;

        //endpoint.messageTypes.forEach((messageType) => {
        //    fillDisplayValues(messageType);
        //    messageTypeParser.parseTheMessageTypeData(messageType);
        //});
    }
    function fillDisplayValues(instance) {
        //$filter('graphduration')(instance.metrics.processingTime);
        //$filter('graphduration')(instance.metrics.criticalTime);
        //$filter('graphdecimal')(instance.metrics.throughput, 2);
        //$filter('graphdecimal')(instance.metrics.retries, 2);
    }
    function navigateToMessageGroup($event, groupId) {
        if ($event.target.localName !== "button") {
            router.push({ name: "message-groups", params: { groupId: groupId } });
        }
    }
    function navigateToEndpointUrl($event, selectedPeriodValue, showInstacesBreakdown, breakdownPageNo) {
        if ($event.target.localName !== "button") {
            var breakdownTabName = showInstacesBreakdown ? 'instancesBreakdown' : 'messageTypeBreakdown';
            // TODO : return `#/monitoring/endpoint/${$scope.endpointName}?historyPeriod=${selectedPeriodValue}&tab=${breakdownTabName}&pageNo=${breakdownPageNo}`;
            router.push({ name: "monitoring/endpoint/", params: { groupId: groupId } });
        }
    }
onMounted(() => {

    getEndpointDetails();
    console.log(endpoint.value);
    console.log(endpoint.errorCount + "," + endpoint.isScMonitoringDisconnected  + "," + endpoint.isStale + "," + endpoint.serviceControlId);
});
</script>

<template>
    <LicenseExpired />
    <template v-if="!licenseStatus.isExpired">
        <div class="container monitoring-view">
            <ServiceControlNotAvailable />
            <template v-if="connectionState.connected">
                <!--MonitoringNotAvailable-->
                <div class="row">
                    <div class="col-sm-12">
                        <MonitoringNotAvailable v-if="!isLoading && !loadedSuccessfully"></MonitoringNotAvailable>
                    </div>
                </div>
                <!--Header-->
                <div class="row monitoring-head" ng-if="loadedSuccessfully">
                    <div class="col-sm-4 no-side-padding list-section">
                        <h1 class="righ-side-ellipsis col-lg-max-10" :title="endpointName">
                            {{endpointName}}: {{endpoint.value.messageTypes.length}}
                        </h1>
                        <div class="endpoint-status col-xs-2">
                            <span class="warning"  v-if="negativeCriticalTimeIsPresent">
                                <i class="fa pa-warning" :title="`Warning: endpoint currently has negative critical time, possibly because of a clock drift.`"></i>
                            </span>
                            <span v-if="endpoint.isStale" class="warning">
                                <i class="fa pa-endpoint-lost endpoint-details" :title="`Unable to connect to endpoint`"></i>
                            </span>
                            <span class="warning" v-if="endpoint.isScMonitoringDisconnected">
                                <i class="fa pa-monitoring-lost endpoint-details" :title="`Unable to connect to monitoring server`"></i>
                            </span>
                            <span class="warning" v-if="endpoint.errorCount" :title="`${endpoint.errorCount} failed messages associated with this endpoint. Click to see list.`">
                                <a v-if="endpoint.errorCount" class="warning cursorpointer" @click="navigateToMessageGroup($event, endpoint.serviceControlId)">
                                    <i class="fa fa-envelope"></i>
                                    <span class="badge badge-important ng-binding cursorpointer"> {{endpoint.errorCount }}</span>
                                </a>
                            </span>
                        </div>
                    </div>
                    <!--filters-->
                    <div class="col-sm-8 no-side-padding toolbar-menus">
                        <div class="filter-group filter-monitoring">
                            <PeriodSelector></PeriodSelector>
                        </div>
                    </div>
                </div>
                <!--large graphs-->
                <div class="container large-graphs" ng-if="loadedSuccessfully">
                    <div class="container">
                        <div class="row">
                            <div class="col-xs-4 no-side-padding list-section graph-area graph-queue-length">
                                <!-- here goes diagram -->
                                <large-graph ng-if="endpoint.metricDetails.metrics.queueLength"
                                             first-data-series="endpoint.metricDetails.metrics.queueLength"
                                             minimum-YAxis="{{largeGraphsMinimumYAxis.queueLength}}"
                                             plot-width="750"
                                             plot-height="200"
                                             first-series-color="#EA7E00"
                                             first-series-fill-color="#EADDCE"
                                             avg-decimals="0"
                                             metric-suffix="MSGS"
                                             class="large-graph pull-left">
                                </large-graph>

                                <div class="col-xs-12 no-side-padding graph-values">
                                    <div class="queue-length-values">
                                        <div class="row">
                                            <span class="metric-digest-header" :title="`Queue length: The number of messages waiting to be processed in the input queue(s) of the endpoint.`">
                                                Queue Length
                                            </span>
                                        </div>
                                    </div>
                                    <div class="row metric-digest-value current">
                                        <div ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                            endpoint.digest.metrics.queueLength.latest | metricslargenumber:0}} <span ng-if="endpoint.isStale == false || endpoint.isScMonitoringDisconnected == false" class="metric-digest-value-suffix">MSGS</span>
                                        </div>
                                        <strong ng-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                    </div>
                                    <div class="row metric-digest-value average">
                                        <div ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                            endpoint.digest.metrics.queueLength.average | metricslargenumber:0}} <span class="metric-digest-value-suffix">MSGS</span>
                                        </div>
                                        <strong ng-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                        <span ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="metric-digest-value-suffix"> AVG</span>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xs-4 no-side-padding list-section graph-area graph-message-retries-throughputs">
                                <!-- here goes diagram -->
                                <large-graph ng-if="endpoint.metricDetails.metrics.throughput"
                                             first-data-series="endpoint.metricDetails.metrics.throughput"
                                             second-data-series="endpoint.metricDetails.metrics.retries"
                                             minimum-YAxis="{{largeGraphsMinimumYAxis.throughputRetries}}"
                                             plot-width="750"
                                             plot-height="200"
                                             first-series-color="#176397"
                                             first-series-fill-color="#CADCE8"
                                             second-series-color="#CC1252"
                                             second-series-fill-color="#E9C4D1"
                                             metric-suffix="MSGS/S"
                                             class="large-graph pull-left">
                                </large-graph>

                                <div class="col-xs-12 no-side-padding graph-values">
                                    <div class="col-xs-6 no-side-padding throughput-values">
                                        <div class="row">
                                            <span class="metric-digest-header" uib-tooltip="Throughput: The number of messages per second successfully processed by a receiving endpoint.">
                                                Throughput
                                            </span>
                                        </div>
                                        <div class="row metric-digest-value current">
                                            <div ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                endpoint.digest.metrics.throughput.latest | metricslargenumber:2}} <span class="metric-digest-value-suffix">MSGS/S</span>
                                            </div>
                                            <strong ng-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                        </div>
                                        <div class="row metric-digest-value average">
                                            <div ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                endpoint.digest.metrics.throughput.average | metricslargenumber:2}} <span class="metric-digest-value-suffix">MSGS/S</span>
                                            </div>
                                            <strong ng-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                            <span ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="metric-digest-value-suffix"> AVG</span>
                                        </div>
                                    </div>
                                    <div class="col-xs-6 no-side-padding scheduled-retries-rate-values">
                                        <div class="row">
                                            <span class="metric-digest-header" uib-tooltip="Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed).">
                                                Scheduled retries
                                            </span>
                                        </div>

                                        <div class="row metric-digest-value current">
                                            <div ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                endpoint.digest.metrics.retries.latest | metricslargenumber:2}} <span class="metric-digest-value-suffix">MSGS/S</span>
                                            </div>
                                            <strong ng-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                        </div>
                                        <div class="row metric-digest-value average">
                                            <div ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                endpoint.digest.metrics.retries.average | metricslargenumber:2}} <span class="metric-digest-value-suffix">MSGS/S</span>
                                            </div>
                                            <strong ng-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                            <span ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="metric-digest-value-suffix"> AVG</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-xs-4 no-side-padding list-section graph-area graph-critical-processing-times">
                                <!-- here goes diagram -->
                                <large-graph ng-if="endpoint.metricDetails.metrics.processingTime"
                                             first-data-series="endpoint.metricDetails.metrics.criticalTime"
                                             second-data-series="endpoint.metricDetails.metrics.processingTime"
                                             minimum-YAxis="{{largeGraphsMinimumYAxis.processingCritical}}"
                                             plot-width="750"
                                             plot-height="200"
                                             first-series-color="#2700CB"
                                             first-series-fill-color="#C4BCE5"
                                             second-series-color="#258135"
                                             second-series-fill-color="#BEE6C5"
                                             is-duration-graph="true"
                                             class="large-graph pull-left">
                                </large-graph>

                                <div class="col-xs-12 no-side-padding graph-values">
                                    <div class="col-xs-6 no-side-padding processing-time-values">
                                        <div class="row">
                                            <span class="metric-digest-header" uib-tooltip="Processing time: The time taken for a receiving endpoint to successfully process a message.">
                                                Processing Time
                                            </span>
                                        </div>
                                        <div class="row metric-digest-value current">
                                            <div ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                endpoint.digest.metrics.processingTime.latest | durationValue}} <span class="metric-digest-value-suffix">endpoint.digest.metrics.processingTime.latest | durationUnit}}</span>
                                            </div>
                                            <strong ng-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                        </div>
                                        <div class="row metric-digest-value average">
                                            <div ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                endpoint.digest.metrics.processingTime.average | durationValue}} <span class="metric-digest-value-suffix">endpoint.digest.metrics.processingTime.average | durationUnit}}</span>
                                            </div>
                                            <strong ng-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                            <span ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="metric-digest-value-suffix"> AVG</span>
                                        </div>
                                    </div>

                                    <div class="col-xs-6 no-side-padding critical-time-values">
                                        <div class="row">
                                            <span class="metric-digest-header" uib-tooltip="Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint.">
                                                Critical Time
                                            </span>
                                        </div>
                                        <div class="row metric-digest-value current">
                                            <div ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                <span ng-class="{'negative': (endpoint.digest.metrics.criticalTime.latest | durationValue) < 0}">endpoint.digest.metrics.criticalTime.latest | durationValue}} </span><span class="metric-digest-value-suffix">endpoint.digest.metrics.criticalTime.latest | durationUnit}}</span>
                                            </div>
                                            <strong ng-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                        </div>
                                        <div class="row metric-digest-value average">
                                            <div ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                <span ng-class="{'negative': (endpoint.digest.metrics.criticalTime.average | durationValue) < 0}">endpoint.digest.metrics.criticalTime.average | durationValue}}</span> <span class="metric-digest-value-suffix">endpoint.digest.metrics.criticalTime.average | durationUnit}} </span>
                                            </div>
                                            <strong ng-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                            <span ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="metric-digest-value-suffix"> AVG</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <!--Messagetypes and instances-->
                <div class="container" ng-if="loadedSuccessfully">
                    <div class="tabs">
                        <h5 ng-class="{active: !showInstancesBreakdown}">
                            <a ng-click="IsShowInstancesBreakdownTab(false)" ng-href="{{buildUrl(selectedPeriod.value, showInstancesBreakdown, endpoint.messageTypesPage)}}" class="ng-binding">Message Types (endpoint.messageTypes.length}})</a>
                        </h5>
                        <h5 ng-class="{active: showInstancesBreakdown}">
                            <a ng-click="IsShowInstancesBreakdownTab(true)" ng-href="{{buildUrl(selectedPeriod.value, showInstancesBreakdown, 1)}}" class="ng-binding">Instances (endpoint.instances.length}})</a>
                        </h5>
                    </div>
                    <!--showInstancesBreakdown-->
                    <section ng-if="showInstancesBreakdown" class="endpoint-instances">
                        <div class="row">
                            <div class="col-xs-12 no-side-padding">

                                <!-- Breakdown by instance-->
                                <div ng-show="loadedSuccessfully" class="row box box-no-click table-head-row">
                                    <div class="col-xs-4 col-xl-8">
                                        <div class="row box-header">
                                            <div class="col-xs-12">
                                                Instance Name
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                        <div class="row box-header">
                                            <div class="col-xs-12 no-side-padding" :title="`Throughput: The number of messages per second successfully processed by a receiving endpoint.`">
                                                Throughput <span class="table-header-unit">(msgs/s)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                        <div class="row box-header">
                                            <div class="col-xs-12 no-side-padding" :title="`Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed).`">
                                                Scheduled retries <span class="table-header-unit">(msgs/s)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                        <div class="row box-header">
                                            <div class="col-xs-12 no-side-padding" :title="`Processing time: The time taken for a receiving endpoint to successfully process a message.`">
                                                Processing Time <span class="table-header-unit">(t)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                        <div class="row box-header">
                                            <div class="col-xs-12 no-side-padding" :title="`Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint.`">
                                                Critical Time <span class="table-header-unit">(t)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <NoData ng-if="endpoint.instances.length == 0" title="No messages" message="No messages processed in this period of time"></NoData>

                                <div class="row endpoint-instances">
                                    <div class="col-xs-12 no-side-padding">
                                        <div class="row box endpoint-row"  v-for="(instance, id) in endpoint.instances" :key="id" >
                                            <div class="col-xs-12 no-side-padding">
                                                <div class="row">
                                                    <div class="col-xs-4 col-xl-8 endpoint-name">
                                                        <div class="row box-header">
                                                            <div class="col-lg-max-9 no-side-padding lead righ-side-ellipsis" uib-tooltip="{{instance.name}}">
                                                                {{instance.name}}
                                                            </div>
                                                            <div class="col-lg-4 no-side-padding endpoint-status">
                                                                <span class="warning" ng-show="instance.metrics.criticalTime.displayValue.value < 0">
                                                                    <i class="fa pa-warning" uib-tooltip="Warning: instance currently has negative critical time, possibly because of a clock drift."></i>
                                                                </span>
                                                                <span class="warning" ng-if="instance.isScMonitoringDisconnected">
                                                                    <i class="fa pa-monitoring-lost endpoint-details" uib-tooltip="Unable to connect to monitoring server"></i>
                                                                </span>
                                                                <span class="warning" ng-if="instance.isStale">
                                                                    <i class="fa pa-endpoint-lost endpoint-details" uib-tooltip="Unable to connect to instance"></i>
                                                                </span>
                                                                <span class="warning" ng-if="instance.errorCount">
                                                                    <a ng-if="instance.errorCount" class="warning btn" href="/#/failed-messages/group/{{instance.serviceControlId}}">
                                                                        <i class="fa fa-envelope" uib-tooltip="{{instance.errorCount | metricslargenumber}} failed messages associated with this endpoint. Click to see list."></i>
                                                                        <span class="badge badge-important ng-binding">instance.errorCount | metricslargenumber}}</span>
                                                                    </a>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                                        <div class="row box-header">
                                                            <div class="no-side-padding">
                                                                <graph plot-data="instance.metrics.throughput" minimum-YAxis="{{smallGraphsMinimumYAxis.throughput}}" avg-label-color="#176397" metric-suffix="MSGS/S" class="graph throughput pull-left"></graph>
                                                            </div>
                                                            <div class="no-side-padding sparkline-value">
                                                                (instance.isStale == true || instance.isScMonitoringDisconnected == true) ? "" : instance.metrics.throughput.displayValue}}
                                                                <strong ng-if="instance.isStale && !instance.isScMonitoringDisconnected" uib-tooltip="No metrics received or instance is not configured to send metrics">?</strong>
                                                                <strong ng-if="instance.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                                        <div class="row box-header">
                                                            <div class="no-side-padding">
                                                                <graph plot-data="instance.metrics.retries" minimum-YAxis="{{smallGraphsMinimumYAxis.retries}}" avg-label-color="#CC1252" metric-suffix="MSGS/S" class="graph retries pull-left"></graph>
                                                            </div>
                                                            <div class="no-side-padding sparkline-value">
                                                                (instance.isStale == true || instance.isScMonitoringDisconnected == true) ? "" : instance.metrics.retries.displayValue}}
                                                                <strong ng-if="instance.isStale && !instance.isScMonitoringDisconnected" uib-tooltip="No metrics received or instance is not configured to send metrics">?</strong>
                                                                <strong ng-if="instance.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                                        <div class="row box-header">
                                                            <div class="no-side-padding">
                                                                <graph plot-data="instance.metrics.processingTime" minimum-YAxis="{{smallGraphsMinimumYAxis.processingTime}}" avg-label-color="#258135" is-duration-graph="true" class="graph processing-time pull-left"></graph>
                                                            </div>
                                                            <div class="no-side-padding sparkline-value" ng-class="instance.metrics.processingTime.displayValue.unit">
                                                                (instance.isStale == true || instance.isScMonitoringDisconnected == true) ? "" : instance.metrics.processingTime.displayValue.value}}
                                                                <strong ng-if="instance.isStale && !instance.isScMonitoringDisconnected" uib-tooltip="No metrics received or instance is not configured to send metrics">?</strong>
                                                                <strong ng-if="instance.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                                                <span ng-if="instance.isStale == false && !!instance.isScMonitoringDisconnected == false" class="unit">
                                                                    instance.metrics.processingTime.displayValue.unit}}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                                        <div class="row box-header">
                                                            <div class="no-side-padding">
                                                                <graph plot-data="instance.metrics.criticalTime" minimum-YAxis="{{smallGraphsMinimumYAxis.criticalTime}}" avg-label-color="#2700CB" is-duration-graph="true" class="graph critical-time pull-left"></graph>
                                                            </div>
                                                            <div class="no-side-padding sparkline-value" ng-class="[instance.metrics.criticalTime.displayValue.unit, {'negative':instance.metrics.criticalTime.displayValue.value < 0}]">
                                                                (instance.isStale == true || instance.isScMonitoringDisconnected == true) ? "" : instance.metrics.criticalTime.displayValue.value}}
                                                                <strong ng-if="instance.isStale && !instance.isScMonitoringDisconnected" uib-tooltip="No metrics received or instance is not configured to send metrics">?</strong>
                                                                <strong ng-if="instance.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                                                <span ng-if="instance.isStale == false && !!instance.isScMonitoringDisconnected == false" class="unit">
                                                                    instance.metrics.criticalTime.displayValue.unit}}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <a ng-if="isRemovingEndpointEnabled" ng-show="instance.isStale" class="remove-endpoint" ng-click="removeEndpoint(endpointName, instance)"><i class="fa fa-trash" uib-tooltip="Remove endpoint"></i></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!--ShowMessagetypes breakdown-->
                    <section ng-if="!showInstancesBreakdown" class="endpoint-message-types">

                        <div class="row">
                            <div class="col-xs-12 no-side-padding">

                                <message-types-change-indicator refresh="endpoint.refreshMessageTypes" message-types-available="endpoint.messageTypesAvailable"></message-types-change-indicator>

                                <!-- Breakdown by message type-->
                                <div ng-show="loadedSuccessfully" class="row box box-no-click table-head-row">
                                    <div class="col-xs-4 col-xl-8">
                                        <div class="row box-header">
                                            <div class="col-xs-12">
                                                Message type name
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                        <div class="row box-header">
                                            <div class="col-xs-12 no-side-padding" uib-tooltip="Throughput: The number of messages per second successfully processed by a receiving endpoint.">
                                                Throughput <span class="table-header-unit">(msgs/s)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                        <div class="row box-header">
                                            <div class="col-xs-12 no-side-padding" uib-tooltip="Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed).">
                                                Scheduled retries <span class="table-header-unit">(msgs/s)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                        <div class="row box-header">
                                            <div class="col-xs-12 no-side-padding" uib-tooltip="Processing time: The time taken for a receiving endpoint to successfully process a message.">
                                                Processing Time <span class="table-header-unit">(t)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                        <div class="row box-header">
                                            <div class="col-xs-12 no-side-padding" uib-tooltip="Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint.">
                                                Critical Time <span class="table-header-unit">(t)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <no-data ng-show="endpoint.messageTypes.length == 0" message="No messages processed in this period of time."></no-data>

                                <div class="row">
                                    <div class="col-xs-12 no-side-padding">
                                        <div class="row box endpoint-row" ng-repeat="messageType in endpoint.messageTypes | orderBy: 'typeName' | limitTo: endpoint.messageTypesItemsPerPage : (endpoint.messageTypesPage-1) * endpoint.messageTypesItemsPerPage">
                                            <div class="col-xs-12 no-side-padding">
                                                <div class="row">
                                                    <div class="col-xs-4 col-xl-8 endpoint-name" uib-tooltip-html="messageType.tooltipText">
                                                        <div class="row box-header">
                                                            <div class="col-lg-max-9 no-side-padding lead message-type-label righ-side-ellipsis">
                                                                <div class="lead">
                                                                    messageType.shortName ? messageType.shortName : 'Unknown'}}
                                                                </div>
                                                            </div>
                                                            <div class="col-lg-4 no-side-padding endpoint-status message-type-status">
                                                                <span class="warning" ng-if="messageType.metrics.criticalTime.displayValue.value < 0">
                                                                    <i class="fa pa-warning" uib-tooltip="Warning: message type currently has negative critical time, possibly because of a clock drift."></i>
                                                                </span>
                                                                <span class="warning" ng-if="endpoint.isScMonitoringDisconnected">
                                                                    <i class="fa pa-monitoring-lost endpoint-details" uib-tooltip="Unable to connect to monitoring server"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div class="row message-type-properties">
                                                            <div ng-show="{{messageType.typeName && messageType.typeName != 'null' && !messageType.containsTypeHierarchy}}" class="message-type-part">
                                                                messageType.assemblyName + '-' + messageType.assemblyVersion}}
                                                            </div>
                                                            <div ng-show="{{messageType.typeName && messageType.typeName != 'null' && messageType.containsTypeHierarchy}}" class="message-type-part" ng-repeat="type in messageType.messageTypeHierarchy">
                                                                type.assemblyName + '-' + type.assemblyVersion}}
                                                            </div>
                                                            <div ng-show="{{messageType.culture && messageType.culture != 'null'}}" class="message-type-part">'Culture=' + messageType.culture}}</div>
                                                            <div ng-show="{{messageType.publicKeyToken && messageType.publicKeyToken != 'null'}}" class="message-type-part">'PublicKeyToken=' + messageType.publicKeyToken}}</div>
                                                        </div>
                                                    </div>
                                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                                        <div class="row box-header">
                                                            <div class="no-side-padding">
                                                                <graph plot-data="messageType.metrics.throughput" minimum-YAxis="{{smallGraphsMinimumYAxis.throughput}}" avg-label-color="#176397" metric-suffix="MSGS/S" class="graph throughput pull-left"></graph>
                                                            </div>
                                                            <div class="no-side-padding sparkline-value">
                                                                (endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : messageType.metrics.throughput.displayValue}}
                                                                <strong ng-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" uib-tooltip="No metrics received or endpoint is not configured to send metrics">?</strong>
                                                                <strong ng-if="endpoint.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                                        <div class="row box-header">
                                                            <div class="no-side-padding">
                                                                <graph plot-data="messageType.metrics.retries" minimum-YAxis="{{smallGraphsMinimumYAxis.retries}}" avg-label-color="#CC1252" metric-suffix="MSGS/S" class="graph retries pull-left"></graph>
                                                            </div>
                                                            <div class="no-side-padding sparkline-value">
                                                                (endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : messageType.metrics.retries.displayValue}}
                                                                <strong ng-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" uib-tooltip="No metrics received or endpoint is not configured to send metrics">?</strong>
                                                                <strong ng-if="endpoint.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                                        <div class="row box-header">
                                                            <div class="no-side-padding">
                                                                <graph plot-data="messageType.metrics.processingTime" minimum-YAxis="{{smallGraphsMinimumYAxis.processingTime}}" avg-label-color="#258135" is-duration-graph="true" class="graph processing-time pull-left"></graph>
                                                            </div>
                                                            <div class="no-side-padding sparkline-value" ng-class="messageType.metrics.processingTime.displayValue.unit">
                                                                (endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : messageType.metrics.processingTime.displayValue.value}}
                                                                <strong ng-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" uib-tooltip="No metrics received or endpoint is not configured to send metrics">?</strong>
                                                                <strong ng-if="endpoint.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                                                <span ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="unit">
                                                                    messageType.metrics.processingTime.displayValue.unit}}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                                        <div class="row box-header">
                                                            <div class="no-side-padding">
                                                                <graph plot-data="messageType.metrics.criticalTime" minimum-YAxis="{{smallGraphsMinimumYAxis.criticalTime}}" avg-label-color="#2700CB" is-duration-graph="true" class="graph critical-time pull-left"></graph>
                                                            </div>
                                                            <div class="no-side-padding sparkline-value" ng-class="[messageType.metrics.criticalTime.displayValue.unit, {'negative':messageType.metrics.criticalTime.displayValue.value < 0}]">
                                                                (endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : messageType.metrics.criticalTime.displayValue.value}}
                                                                <strong ng-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" uib-tooltip="No metrics received or endpoint is not configured to send metrics">?</strong>
                                                                <strong ng-if="endpoint.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                                                <span ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="unit">
                                                                    messageType.metrics.criticalTime.displayValue.unit}}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row list-pagination">
                                    <ul uib-pagination ng-show="endpoint.messageTypesTotalItems >  endpoint.messageTypesItemsPerPage" total-items="endpoint.messageTypesTotalItems" ng-model="endpoint.messageTypesPage" items-per-page="endpoint.messageTypesItemsPerPage" max-size="10" boundary-link-numbers="true" ng-change="updateUrl()"></ul>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </template>
        </div>
    </template>



</template>
