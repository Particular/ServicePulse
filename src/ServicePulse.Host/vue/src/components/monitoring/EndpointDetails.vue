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
    var isLoading = ref(true);
    var loadedSuccessfully = ref(false);
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
    var negativeCriticalTimeIsPresent = ref(false);
    endpoint.value.messageTypesPage = !showInstancesBreakdown ? route.params.pageNo : 1;
    endpoint.value.messageTypesTotalItems = 0;
    endpoint.value.messageTypesItemsPerPage = 10
    endpoint.value.messageTypesAvailable = ref(false);
    endpoint.value.messageTypesUpdatedSet = [];
    endpoint.value.instances = [];

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
                   return updateUI();
                })
                .catch((err) => {
                    console.log(err);
                    return { error: err };

                });
        }
    }

    function updateUI() {

        isLoading.value = false;

        if (endpoint.value.error) {
            //connectivityNotifier.reportFailedConnection();
            if (endpoint && endpoint.value.instances) {
                endpoint.value.instances.forEach((item) => item.isScMonitoringDisconnected = true);
            }
            endpoint.value.isScMonitoringDisconnected = true;

        } else {

            if (endpoint.value.messageTypesTotalItems > 0 &&
                endpoint.value.messageTypesTotalItems !== endpoint.value.messageTypes.length) {

                mergeIn(endpoint.value, endpoint.value, ['messageTypes']);

                endpoint.value.messageTypesAvailable.value = true;
                endpoint.value.messageTypesUpdatedSet = endpoint.value.messageTypes;

            }
            else {
                mergeIn(endpoint.value, endpoint.value);
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

            endpoint.value.isStale = true;
            endpoint.value.isScMonitoringDisconnected = false;
            negativeCriticalTimeIsPresent.value = false;

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
                endpoint.value.isStale = endpoint.value.isStale && instance.isStale;
                negativeCriticalTimeIsPresent |= formatGraphDuration(instance.metrics.criticalTime).value < 0;
            });

            loadedSuccessfully.value = true;
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
    //function IsShowInstancesBreakdownTab (isVisible) {
    //   showInstancesBreakdown = isVisible;
    //    refreshMessageTypes();
    //};

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
        if (endpoint.value.messageTypesAvailable) {
            endpoint.value.messageTypesAvailable.value = false;

            endpoint.value.messageTypes = endpoint.value.messageTypesUpdatedSet;
            endpoint.value.messageTypesUpdatedSet = null;

            processMessageTypes();
        }
    }

    function processMessageTypes() {

        endpoint.value.messageTypesTotalItems = endpoint.value.messageTypes.length;

        endpoint.value.messageTypes.forEach((messageType) => {
            fillDisplayValues(messageType);
            messageType=parseTheMessageTypeData(messageType);
        });
    }
    function fillDisplayValues(instance) {
        //$filter('graphduration')(instance.metrics.processingTime);
        //$filter('graphduration')(instance.metrics.criticalTime);
        //$filter('graphdecimal')(instance.metrics.throughput, 2);
        //$filter('graphdecimal')(instance.metrics.retries, 2);
    }

    function parseTheMessageTypeData(messageType) {
        if (!messageType.typeName)
            return;

        if (messageType.typeName.indexOf(';') > 0) {
            var messageTypeHierarchy = messageType.typeName.split(';');
            messageTypeHierarchy = messageTypeHierarchy.map((item) => {
                var obj = {};
                var segments = item.split(',');
                obj.typeName = segments[0];
                obj.assemblyName = segments[1];
                obj.assemblyVersion = segments[2].substring(segments[2].indexOf('=') + 1);

                if (!segments[4].endsWith('=null')) { //SC monitoring fills culture only if PublicKeyToken is filled
                    obj.culture = segments[3];
                    obj.publicKeyToken = segments[4];
                }
                return obj;
            });
            messageType.messageTypeHierarchy = messageTypeHierarchy;
            messageType.typeName =
                messageTypeHierarchy.map(item => item.typeName).join(", ");
            messageType.shortName = messageTypeHierarchy.map(item => shortenTypeName(item.typeName)).join(", ");
            messageType.containsTypeHierarchy = true;
            messageType.tooltipText = messageTypeHierarchy.reduce((sum, item) => (sum ? `${sum}<br> ` : '') +
                `${item.typeName} |${item.assemblyName}-${item.assemblyVersion}` + (item.culture ? ` |${item.culture}` : '') + (item.publicKeyToken ? ` |${item.publicKeyToken}` : ''),
                '');
        } else {
            //Get the name without the namespace
            messageType.shortName = shortenTypeName(messageType.typeName);

            var tooltip = `${messageType.typeName} | ${messageType.assemblyName}-${messageType.assemblyVersion}`;
            if (messageType.culture && messageType.culture != 'null') {
                tooltip += ` | Culture=${messageType.culture}`;
            }

            if (messageType.publicKeyToken && messageType.publicKeyToken != 'null') {
                tooltip += ` | PublicKeyToken=${messageType.publicKeyToken}`;
            }

            messageType.tooltipText = tooltip;
        }
    }

    function shortenTypeName(typeName) {
        return typeName.split('.').pop();
    }

    function navigateToMessageGroup($event, groupId) {
        if ($event.target.localName !== "button") {
            router.push({ name: "message-groups", params: { groupId: groupId } });
        }
    }
    function navigateToEndpointUrl($event, isVisible, breakdownPageNo) {
        if ($event.target.localName !== "button") {
            showInstancesBreakdown = isVisible;
            refreshMessageTypes();
            var breakdownTabName = showInstancesBreakdown ? 'instancesBreakdown' : 'messageTypeBreakdown';
            router.push({ name: "endpoint-details", params: { endpointName: endpointName }, query: { historyPeriod: selectedHistoryPeriod, tab: breakdownTabName, pageNo: breakdownPageNo } });

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
                displayValue: 0,
            };
        }
    }

onMounted(() => {

    getEndpointDetails();
    console.log(endpoint.value);
    console.log(endpoint.value.messageTypes);
    console.log(isLoading.value+","+loadedSuccessfully.value +","+endpoint.errorCount + "," + endpoint.isScMonitoringDisconnected + "," + endpoint.isStale + "," + endpoint.serviceControlId );
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
                <div class="row monitoring-head" v-if="loadedSuccessfully">
                    <div class="col-sm-4 no-side-padding list-section">
                        <h1 class="righ-side-ellipsis col-lg-max-10" :title="endpointName">
                            {{endpointName}}
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
                <div class="container large-graphs" v-if="loadedSuccessfully">
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
                                        <div v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                            endpoint.digest.metrics.queueLength.latest | metricslargenumber:0}} <span v-if="endpoint.isStale == false || endpoint.isScMonitoringDisconnected == false" class="metric-digest-value-suffix">MSGS</span>
                                        </div>
                                        <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                    </div>
                                    <div class="row metric-digest-value average">
                                        <div v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                            endpoint.digest.metrics.queueLength.average | metricslargenumber:0}} <span class="metric-digest-value-suffix">MSGS</span>
                                        </div>
                                        <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                        <span v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="metric-digest-value-suffix"> AVG</span>
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
                                            <span class="metric-digest-header" :title="`Throughput: The number of messages per second successfully processed by a receiving endpoint.`">
                                                Throughput
                                            </span>
                                        </div>
                                        <div class="row metric-digest-value current">
                                            <div v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                endpoint.digest.metrics.throughput.latest | metricslargenumber:2}} <span class="metric-digest-value-suffix">MSGS/S</span>
                                            </div>
                                            <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                        </div>
                                        <div class="row metric-digest-value average">
                                            <div v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                endpoint.digest.metrics.throughput.average | metricslargenumber:2}} <span class="metric-digest-value-suffix">MSGS/S</span>
                                            </div>
                                            <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                            <span v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="metric-digest-value-suffix"> AVG</span>
                                        </div>
                                    </div>
                                    <div class="col-xs-6 no-side-padding scheduled-retries-rate-values">
                                        <div class="row">
                                            <span class="metric-digest-header" :title="`Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed).`">
                                                Scheduled retries
                                            </span>
                                        </div>

                                        <div class="row metric-digest-value current">
                                            <div v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                endpoint.digest.metrics.retries.latest | metricslargenumber:2}} <span class="metric-digest-value-suffix">MSGS/S</span>
                                            </div>
                                            <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                        </div>
                                        <div class="row metric-digest-value average">
                                            <div v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                endpoint.digest.metrics.retries.average | metricslargenumber:2}} <span class="metric-digest-value-suffix">MSGS/S</span>
                                            </div>
                                            <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                            <span v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="metric-digest-value-suffix"> AVG</span>
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
                                            <span class="metric-digest-header" :title="`Processing time: The time taken for a receiving endpoint to successfully process a message.`">
                                                Processing Time
                                            </span>
                                        </div>
                                        <div class="row metric-digest-value current">
                                            <div v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                endpoint.digest.metrics.processingTime.latest | durationValue}} <span class="metric-digest-value-suffix">endpoint.digest.metrics.processingTime.latest | durationUnit}}</span>
                                            </div>
                                            <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                        </div>
                                        <div class="row metric-digest-value average">
                                            <div v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                endpoint.digest.metrics.processingTime.average | durationValue}} <span class="metric-digest-value-suffix">endpoint.digest.metrics.processingTime.average | durationUnit}}</span>
                                            </div>
                                            <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                            <span v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="metric-digest-value-suffix"> AVG</span>
                                        </div>
                                    </div>

                                    <div class="col-xs-6 no-side-padding critical-time-values">
                                        <div class="row">
                                            <span class="metric-digest-header" :title="`Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint.`">
                                                Critical Time
                                            </span>
                                        </div>
                                        <div class="row metric-digest-value current">
                                            <div v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                <span ng-class="{'negative': (endpoint.digest.metrics.criticalTime.latest | durationValue) < 0}">endpoint.digest.metrics.criticalTime.latest | durationValue}} </span><span class="metric-digest-value-suffix">endpoint.digest.metrics.criticalTime.latest | durationUnit}}</span>
                                            </div>
                                            <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                        </div>
                                        <div class="row metric-digest-value average">
                                            <div v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false">
                                                <span ng-class="{'negative': (endpoint.digest.metrics.criticalTime.average | durationValue) < 0}">endpoint.digest.metrics.criticalTime.average | durationValue}}</span> <span class="metric-digest-value-suffix">endpoint.digest.metrics.criticalTime.average | durationUnit}} </span>
                                            </div>
                                            <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                                            <span v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="metric-digest-value-suffix"> AVG</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <!--Messagetypes and instances-->
                <div class="container" v-if="loadedSuccessfully">
                    <!--tabs-->
                    <div class="tabs">
                        <h5 ng-class="{active: !showInstancesBreakdown}">
                            <a @click="navigateToEndpointUrl($event,false,endpoint.messageTypesPage)"  class="cursorpointer ng-binding">Message Types ({{endpoint.messageTypes.length}})</a>
                        </h5>
                        <h5 ng-class="{active: showInstancesBreakdown}">
                            <a @click="navigateToEndpointUrl($event,true, 1)" class="cursorpointer ng-binding">Instances ({{endpoint.instances.length}})</a>
                        </h5>
                    </div>

                    <!--showInstancesBreakdown-->
                    <section v-if="showInstancesBreakdown" class="endpoint-instances">
                        <div class="row">
                            <div class="col-xs-12 no-side-padding">

                                <!-- Breakdown by instance-->
                                <!--headers-->
                                <div v-if="loadedSuccessfully" class="row box box-no-click table-head-row">
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
                                <NoData v-if="endpoint.instances.length == 0" title="No messages" message="No messages processed in this period of time"></NoData>

                                <div class="row endpoint-instances">
                                    <div class="col-xs-12 no-side-padding">
                                        <div class="row box endpoint-row" v-for="(instance, id) in endpoint.instances" :key="id">
                                            <div class="col-xs-12 no-side-padding">
                                                <div class="row">
                                                    <div class="col-xs-4 col-xl-8 endpoint-name">
                                                        <div class="row box-header">
                                                            <div class="col-lg-max-9 no-side-padding lead righ-side-ellipsis" :title="instance.name">
                                                                {{instance.name}}
                                                            </div>
                                                            <div class="col-lg-4 no-side-padding endpoint-status">
                                                                <span class="warning" ng-show="instance.metrics.criticalTime.displayValue.value < 0">
                                                                    <i class="fa pa-warning" :title="`Warning: instance currently has negative critical time, possibly because of a clock drift.`"></i>
                                                                </span>
                                                                <span class="warning" v-if="instance.isScMonitoringDisconnected">
                                                                    <i class="fa pa-monitoring-lost endpoint-details" :title="`Unable to connect to monitoring server`"></i>
                                                                </span>
                                                                <span class="warning" v-if="instance.isStale">
                                                                    <i class="fa pa-endpoint-lost endpoint-details" :title="`Unable to connect to instance`"></i>
                                                                </span>
                                                                <span class="warning" v-if="instance.errorCount">
                                                                    <a v-if="instance.errorCount" class="warning btn" href="/#/failed-messages/group/{{instance.serviceControlId}}">
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
                                                                {{(instance.isStale == true || instance.isScMonitoringDisconnected == true) ? "" : instance.metrics.throughput.displayValue}}
                                                                <strong v-if="instance.isStale && !instance.isScMonitoringDisconnected" :title="`No metrics received or instance is not configured to send metrics`">?</strong>
                                                                <strong v-if="instance.isScMonitoringDisconnected" :title="`Unable to connect to monitoring server`">?</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                                        <div class="row box-header">
                                                            <div class="no-side-padding">
                                                                <graph plot-data="instance.metrics.retries" minimum-YAxis="{{smallGraphsMinimumYAxis.retries}}" avg-label-color="#CC1252" metric-suffix="MSGS/S" class="graph retries pull-left"></graph>
                                                            </div>
                                                            <div class="no-side-padding sparkline-value">
                                                                {{(instance.isStale == true || instance.isScMonitoringDisconnected == true) ? "" : instance.metrics.retries.displayValue}}
                                                                <strong v-if="instance.isStale && !instance.isScMonitoringDisconnected" :title="`No metrics received or instance is not configured to send metrics`">?</strong>
                                                                <strong v-if="instance.isScMonitoringDisconnected" :title="`Unable to connect to monitoring server`">?</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                                        <div class="row box-header">
                                                            <div class="no-side-padding">
                                                                <graph plot-data="instance.metrics.processingTime" minimum-YAxis="{{smallGraphsMinimumYAxis.processingTime}}" avg-label-color="#258135" is-duration-graph="true" class="graph processing-time pull-left"></graph>
                                                            </div>
                                                            <div class="no-side-padding sparkline-value" ng-class="instance.metrics.processingTime.displayValue.unit">
                                                                {{(instance.isStale == true || instance.isScMonitoringDisconnected == true) ? "" : instance.metrics.processingTime.displayValue.value}}
                                                                <strong v-if="instance.isStale && !instance.isScMonitoringDisconnected" :title="`No metrics received or instance is not configured to send metrics`">?</strong>
                                                                <strong v-if="instance.isScMonitoringDisconnected" :title="`Unable to connect to monitoring server`">?</strong>
                                                                <span v-if="instance.isStale == false && !!instance.isScMonitoringDisconnected == false" class="unit">
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
                                                                {{(instance.isStale == true || instance.isScMonitoringDisconnected == true) ? "" : instance.metrics.criticalTime.displayValue.value}}
                                                                <strong v-if="instance.isStale && !instance.isScMonitoringDisconnected" :title="`No metrics received or instance is not configured to send metrics`">?</strong>
                                                                <strong v-if="instance.isScMonitoringDisconnected" :title="`Unable to connect to monitoring server`">?</strong>
                                                                <span v-if="instance.isStale == false && !!instance.isScMonitoringDisconnected == false" class="unit">
                                                                    instance.metrics.criticalTime.displayValue.unit}}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <a ng-if="isRemovingEndpointEnabled" v-if="instance.isStale" class="remove-endpoint" ng-click="removeEndpoint(endpointName, instance)"><i class="fa fa-trash" :title="`Remove endpoint`"></i></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!--ShowMessagetypes breakdown-->
                    <section v-if="!showInstancesBreakdown" class="endpoint-message-types">

                        <div class="row">
                            <div class="col-xs-12 no-side-padding">

                                <message-types-change-indicator refresh="endpoint.refreshMessageTypes" message-types-available="endpoint.messageTypesAvailable"></message-types-change-indicator>

                                <!-- Breakdown by message type-->
                                <!--headers-->
                                <div v-if="loadedSuccessfully" class="row box box-no-click table-head-row">
                                    <div class="col-xs-4 col-xl-8">
                                        <div class="row box-header">
                                            <div class="col-xs-12">
                                                Message type name
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

                                <no-data v-if="endpoint.messageTypes.length == 0" message="No messages processed in this period of time."></no-data>

                                <div class="row">
                                    <div class="col-xs-12 no-side-padding">
                                        <div class="row box endpoint-row" v-for="(messageType, id) in endpoint.messageTypes" :key="id" ng-repeat="messageType in endpoint.messageTypes | orderBy: 'typeName' | limitTo: endpoint.messageTypesItemsPerPage : (endpoint.messageTypesPage-1) * endpoint.messageTypesItemsPerPage">
                                            <div class="col-xs-12 no-side-padding">
                                                <div class="row">
                                                    <div class="col-xs-4 col-xl-8 endpoint-name" uib-tooltip-html="messageType.tooltipText">
                                                        <div class="row box-header">
                                                            <div class="col-lg-max-9 no-side-padding lead message-type-label righ-side-ellipsis">
                                                                <div class="lead">
                                                                    {{ messageType.shortName ? messageType.shortName : 'Unknown'}}
                                                                </div>
                                                            </div>
                                                            <div class="col-lg-4 no-side-padding endpoint-status message-type-status">
                                                                <span class="warning" ng-if="messageType.metrics.criticalTime.displayValue.value < 0">
                                                                    <i class="fa pa-warning" :title="`Warning: message type currently has negative critical time, possibly because of a clock drift.`"></i>
                                                                </span>
                                                                <span class="warning" v-if="endpoint.isScMonitoringDisconnected">
                                                                    <i class="fa pa-monitoring-lost endpoint-details" :title="`Unable to connect to monitoring server`"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div class="row message-type-properties">
                                                            <div v-if="messageType.typeName && messageType.typeName != 'null' && !messageType.containsTypeHierarchy" class="message-type-part">
                                                                {{messageType.assemblyName + '-' + messageType.assemblyVersion}}
                                                            </div>
                                                            <div v-if="messageType.typeName && messageType.typeName != 'null' && messageType.containsTypeHierarchy" class="message-type-part" v-for="(type, id) in messageType.messageTypeHierarchy" :key="id" ng-repeat="type in messageType.messageTypeHierarchy">
                                                                {{type.assemblyName + '-' + type.assemblyVersion}}
                                                            </div>
                                                            <div v-if="messageType.culture && messageType.culture != 'null'" class="message-type-part">{{'Culture=' + messageType.culture}}</div>
                                                            <div v-if="messageType.publicKeyToken && messageType.publicKeyToken != 'null'" class="message-type-part">{{'PublicKeyToken=' + messageType.publicKeyToken}}</div>
                                                        </div>
                                                    </div>
                                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                                        <div class="row box-header">
                                                            <div class="no-side-padding">
                                                                <graph plot-data="messageType.metrics.throughput" minimum-YAxis="{{smallGraphsMinimumYAxis.throughput}}" avg-label-color="#176397" metric-suffix="MSGS/S" class="graph throughput pull-left"></graph>
                                                            </div>
                                                            <div class="no-side-padding sparkline-value">
                                                                (endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : messageType.metrics.throughput.displayValue}}
                                                                <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" :title="`No metrics received or endpoint is not configured to send metrics`">?</strong>
                                                                <strong v-if="endpoint.isScMonitoringDisconnected" :title="`Unable to connect to monitoring server`">?</strong>
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
                                                                <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" :title="`No metrics received or endpoint is not configured to send metrics`">?</strong>
                                                                <strong v-if="endpoint.isScMonitoringDisconnected" :title="`Unable to connect to monitoring server`">?</strong>
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
                                                                <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" :title="`No metrics received or endpoint is not configured to send metrics`">?</strong>
                                                                <strong v-if="endpoint.isScMonitoringDisconnected" :title="`Unable to connect to monitoring server`">?</strong>
                                                                <span v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="unit">
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
                                                                <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" :title="`No metrics received or endpoint is not configured to send metrics`">?</strong>
                                                                <strong v-if="endpoint.isScMonitoringDisconnected" :title="`Unable to connect to monitoring server`">?</strong>
                                                                <span v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="unit">
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

<style>
.monitoring-head h1 {
	margin-bottom: 10px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.monitoring-head .msg-group-menu {
	margin: 6px 0px 0 6px;
	padding-right: 0;
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

.pa-endpoint-lost.endpoint-details {
	background-image: url('../../../a/img/endpoint-lost.svg');
	background-position: center;
	background-repeat: no-repeat;
}

.pa-monitoring-lost.endpoint-details {
	background-image: url('../../../a/img/monitoring-lost.svg');
	background-position: center;
	background-repeat: no-repeat;
}

.monitoring-head .endpoint-status .pa-endpoint-lost.endpoint-details,
.monitoring-head .endpoint-status .pa-monitoring-lost.endpoint-details {
	width: 32px;
	height: 30px;
}

.endpoint-status .pa-endpoint-lost.endpoint-details,
.endpoint-status .pa-monitoring-lost.endpoint-details,
.endpoint-status .pa-endpoint-lost.endpoints-overview,
.endpoint-status .pa-monitoring-lost.endpoints-overview {
	width: 26px;
	height: 26px;
	left: 6px;
	position: relative;
}

i.fa.pa-endpoint-lost.endpoints-overview,
i.fa.pa-monitoring-lost.endpoints-overview {
	position: relative;
	margin-right: 4px;
}

.filter-group.filter-monitoring {
	width: 100%;

}

.filter-group.filter-monitoring:before {
	position: absolute;
	top: 41px;
}

.filter-group.filter-monitoring input {
	margin-top: 33px;
	float: none;
}

.monitoring-view .filter-group.filter-monitoring:before {
	top: 41px;
}

.monitoring-view .dropdown {
	top: 33px;
	margin-left: 25px;
	width: 250px;
}

.monitoring-view .dropdown .dropdown-menu {
	top: 36px;
	margin-left: 72px;
}

.pa-monitoring {
	background-image: url('@/assets/monitoring.svg');
	background-position: center;
	background-repeat: no-repeat;
	width: 16px;
	height: 14px;
	position: relative;
	top: 2px;
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

@media all and (-ms-high-contrast: none),
(-ms-high-contrast: active) {
	.righ-side-ellipsis {
		direction: ltr;
	}
}

.no-side-padding {
	padding-right: 0;
	padding-left: 0;
}


.endpoint-status {
	display: inline-block;
	position: absolute;
	top: 1px;
	margin-left: 7px;
	padding-left: 0;
}

.endpoint-status i.fa-envelope,
.endpoint-status i.fa-exclamation-triangle {
	font-size: 20px;
	color: #CE4844;
}

h1 .endpoint-status i.fa-envelope,
.endpoint-status i.fa-exclamation-triangle {
	font-size: 24px;
}

.endpoint-status i.fa-envelope {
	color: #777f7f;
}

.endpoint-status i.fa-envelope:hover {
	color: #23527c;
}

.overview-row-badge {
	margin-left: 5px;
}

.endpoint-status .badge {
	position: relative;
	top: 8px;
	font-size: 10px;
	margin-right: 0;
	left: -10px;
}

.endpoint-status i.fa-envelope,
.endpoint-name i.fa-exclamation-triangle {
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

.endpoint-status .badge {
	position: relative;
	top: 2px;
	left: -9px;
	font-size: 10px;
}

.endpoint-message-types .endpoint-status {
	margin-top: -8px;
}

.warning {
	color: red;
}

.warning i {
	color: #BE0202;
}

p.lead hard-wrap.ng-binding {
	color: #777f7f;
}

button.btn.btn-default.ng-binding.ng-isolate-scope {
	margin-right: 4px !important;
}


.filter-group {
	display: flex;
	justify-content: flex-end;
	width: 50%;
	position: relative;
	top: -3px;
	margin-top: -26px;
	float: right;
}

.filter-group:before {
	width: 16px;
	font-family: 'FontAwesome';
	width: 20px;
	content: "\f0b0";
	color: #919E9E;
	position: absolute;
	top: 29px;
	right: 250px;
}

.filter-group input {
	display: inline-block;
	width: 280px;
	margin: 21px 0 0 15px;
	padding-right: 10px;
	padding-left: 30px;
	border: 1px solid #aaa;
	border-radius: 4px;
	float: right;
}

.filter-group.filter-monitoring {
	width: 100%;

}

.filter-group.filter-monitoring:before {
	position: absolute;
	top: 41px;
}

.filter-group.filter-monitoring input {
	margin-top: 33px;
	float: none;
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

.no-side-padding {
	padding-right: 0;
	padding-left: 0;
}

.list-section {
	margin-top: 14px;
}

@media (min-width: 768px) {
	.navbar-nav>li.active>a {
		background: transparent !important;
		border-bottom: 5px solid #00A3C4;
	}

	.navbar-nav>li>a {
		padding-bottom: 15px;
		padding-top: 20px;
	}

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
	stroke-dasharray: 5, 5;
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

.graph-message-retries-throughputs,
.graph-critical-processing-times {
	margin-left: 0.5%;
}

.graph-queue-length .current,
.graph-queue-length .average {
	border-color: #EA7E00;
}

.queue-length-values {
	display: inline-block;
}

.queue-length-values .metric-digest-header {
	color: #EA7E00;
}

.metric-digest {
	padding: 1em;
}

.metric-digest-header {
	text-transform: uppercase;
	display: inline-block;
	font-size: 14px;
	font-weight: bold;
}

.throughput-values span.metric-digest-header {
	color: #176397;
}

.graph-queue-length .current,
.graph-queue-length .average {
	border-color: #EA7E00;
}

.throughput-values span.metric-digest-header {
	color: #176397;
}

.throughput-values .current,
.throughput-values .average {
	border-color: #176397;
}

.scheduled-retries-rate-values span.metric-digest-header {
	color: #CC1252;
}

.scheduled-retries-rate-values .current,
.scheduled-retries-rate-values .average {
	border-color: #CC1252;
}

.critical-time-values span.metric-digest-header {
	color: #2700CB;
}

.critical-time-values .current,
.critical-time-values .average {
	border-color: #2700CB;
}

.processing-time-values span.metric-digest-header {
	color: #279039;
}

.processing-time-values .current,
.processing-time-values .average {
	border-color: #279039;
}

.metric-digest-value {
	font-weight: bold;
	font-size: 22px;
}

.metric-digest-value div {
	display: inline-block;
}

.metric-digest-value-suffix {
	font-weight: normal;
	font-size: 14px;
	display: inline-block;
	text-transform: uppercase;
}

.metric-digest {
	padding: 1em;
}

.metric-digest-value {
	font-weight: bold;
	font-size: 22px;
}

.metric-digest-value div {
	display: inline-block;
}


.current,
.average {
	margin-top: 4px;
	margin-bottom: 8px;
	padding-left: 4px;
	line-height: 20px;
	height: 19px;
}

.current {
	border-left: 2.5px solid;
}

.average {
	border-left: 1px dashed;
	padding-left: 6px;
}

.toolbar-menus.endpoint-details {
	display: flex;
	margin-bottom: 5px;
	justify-content: flex-end;
}

.endpoint-row a.remove-endpoint {
	display: none;
}

.endpoint-row:hover a.remove-endpoint {
	display: block;
	position: absolute;
	top: 17px;
	right: 22px;
}

.table-head-row {
	font-size: 12px;
	text-transform: uppercase;
	color: #181919;
	padding-bottom: 5px;
}

.table-head-row p {
	font-size: 12px;
	text-transform: uppercase;
	color: #181919;
	text-transform: initial;
}

.table-head-row span.table-header-unit {
	color: #777f7f;
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

.graph-area {
	width: 33%;
	box-sizing: border-box;
}


</style>