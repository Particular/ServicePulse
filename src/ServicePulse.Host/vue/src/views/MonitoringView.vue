<script setup>
    import { ref, onMounted } from "vue";
    import LicenseExpired from "../components/LicenseExpired.vue";
    import { licenseStatus } from "../composables/serviceLicense.js";
    import ServiceControlNotAvailable from "../components/ServiceControlNotAvailable.vue";
   // import { connectionState, monitoringConnectionState } from "../composables/serviceServiceControl";
   // import { useIsMonitoringEnabled } from "../composables/serviceServiceControlUrls";
    import { useRedirects } from "../composables/serviceRedirects.js";
    //import { MonitoringNoData } from "../components/monitoring/MonitoringNoData.vue";
    // import { MonitoringNotAvailable } from "../components/monitoring/MonitoringNotAvailable.vue";

    const redirectCount = ref(0);

    //function updateRedirectCount(newCount) {
    //    redirectCount.value = newCount;
    //}

    //function subIsActive(subPath) {
    //    return window.location.hash.endsWith(subPath);
    //}

    onMounted(() => {
        useRedirects().then((result) => {
            redirectCount.value = result.total;
        });
    });
    /*
      $scope.periods = historyPeriodsService.getAllPeriods();
  $scope.selectedPeriod = historyPeriodsService.getDefaultPeriod();
  onnectionsManager.getMonitoringUrl();
  monitoringService.getServiceControlMonitoringVersion()
  monitoringService.getMonitoredEndpoints()
   monitoringService.removeEndpointInstance
   monitoringService.createEndpointDetailsSource($routeParams.endpointName, selectedPeriod.value, selectedPeriod.refreshInterval).subscribe(function (endpoint) {
   monitoringService.createEndpointsSource(selectedPeriod.value, selectedPeriod.refreshInterval)
  \angular\app\modules\monitoring\js\services\services.monitoring.js
    */
</script>


<template>

    <LicenseExpired />
    <template v-if="!licenseStatus.isExpired">
        <div class="container">
            <ServiceControlNotAvailable />
            <template v-if="connectionState.connected">
                <!--filters-->
                <div class="row">
                    <div class="col-6 list-section">
                        <h1>Endpoints Overview</h1>
                    </div>
                    <div class="col-6 toolbar-menus no-side-padding">
                        <div class="msg-group-menu dropdown">
                            <label class="control-label">Group by:</label>
                            <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                selectedClassifier
                                <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu">
                                <li>
                                    <a> classifier1</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!--Table headings-->
                <div ng-show="endpoints.length" class="row box box-no-click table-head-row">
                    <div class="col-xs-2 col-xl-7">
                        <sortable-column property="'name'" ref="order">
                            Endpoint name
                        </sortable-column>
                    </div>
                    <div class="col-xs-2 col-xl-1 no-side-padding">
                        <sortable-column property="'metrics.queueLength.average'"
                                         ref="order"
                                         uib-tooltip="Queue length: The number of messages waiting to be processed in the input queue(s) of the endpoint.">
                            Queue Length <span class="table-header-unit">(msgs)</span>
                        </sortable-column>
                    </div>
                    <div class="col-xs-2 col-xl-1 no-side-padding">
                        <sortable-column property="'metrics.throughput.average'"
                                         ref="order"
                                         uib-tooltip="Throughput: The number of messages per second successfully processed by a receiving endpoint.">
                            Throughput <span class="table-header-unit">(msgs/s)</span>
                        </sortable-column>
                    </div>
                    <div class="col-xs-2 col-xl-1 no-side-padding">
                        <sortable-column property="'metrics.retries.average'"
                                         ref="order"
                                         uib-tooltip="Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed).">
                            Scheduled retries <span class="table-header-unit">(msgs/s)</span>
                        </sortable-column>
                    </div>
                    <div class="col-xs-2 col-xl-1 no-side-padding">
                        <sortable-column property="'metrics.processingTime.average'"
                                         ref="order"
                                         uib-tooltip="Processing time: The time taken for a receiving endpoint to successfully process a message.">
                            Processing Time <span class="table-header-unit">(t)</span>
                        </sortable-column>
                    </div>
                    <div class="col-xs-2 col-xl-1 no-side-padding">
                        <sortable-column property="'metrics.criticalTime.average'"
                                         ref="order"
                                         uib-tooltip="Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint.">
                            Critical Time <span class="table-header-unit">(t)</span>
                        </sortable-column>
                    </div>
                </div>

                <!--endpointlist-->
                <div class="row">
                    <div class="col-xs-12 no-side-padding">
                        <div class="row box endpoint-row" ng-repeat="endpoint in endpoints | filter: filter | orderBy: order.expression" ng-mouseenter="endpoint.hover1=true" ng-mouseleave="endpoint.hover1=false">
                            <div class="col-xs-12 no-side-padding">
                                <div class="row">
                                    <div class="col-xs-2 col-xl-7 endpoint-name name-overview">
                                        <div class="row box-header">
                                            <div class="col-lg-max-8 no-side-padding lead righ-side-ellipsis endpoint-details-link">
                                                <a ng-click="endpoint.isExpanded = !endpoint.isExpanded" ng-href="{{getDetailsUrl(endpoint)}}" uib-tooltip="{{endpoint.name}}">endpoint.name</a>
                                            </div>
                                            <span class="endpoint-count" ng-if="endpoint.connectedCount || endpoint.disconnectedCount" uib-tooltip="Endpoint instance(s): {{endpoint.connectedCount || 0}}">(endpoint.connectedCount || 0)</span>
                                            <div class="col-xs-5 no-side-padding endpoint-status">
                                                <span class="warning" ng-if="endpoint.metrics.criticalTime.displayValue.value < 0">
                                                    <i class="fa pa-warning" uib-tooltip="Warning: endpoint currently has negative critical time, possibly because of a clock drift."></i>
                                                </span>
                                                <span class="warning" ng-if="endpoint.isScMonitoringDisconnected">
                                                    <i class="fa pa-monitoring-lost endpoints-overview" uib-tooltip="Unable to connect to monitoring server"></i>
                                                </span>
                                                <span class="warning" ng-if="endpoint.isStale && (!supportsEndpointCount || !endpoint.connectedCount)" uib-tooltip="No data received from any instance">
                                                    <a class="monitoring-lost-link" ng-href="{{getDetailsUrl(endpoint)}}&tab=instancesBreakdown"><i class="fa pa-endpoint-lost endpoints-overview"></i></a>
                                                </span>
                                                <span class="warning" ng-if="endpoint.errorCount" uib-tooltip="{{endpoint.errorCount | metricslargenumber}} failed messages associated with this endpoint. Click to see list.">
                                                    <a ng-if="endpoint.errorCount" class="warning btn" href="/#/failed-messages/group/{{endpoint.serviceControlId}}">
                                                        <i class="fa fa-envelope"></i>
                                                        <span class="badge badge-important ng-binding">endpoint.errorCount | metricslargenumber</span>
                                                    </a>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                        <div class="row box-header">
                                            <div class="no-side-padding">
                                                <graph plot-data="endpoint.metrics.queueLength" minimum-YAxis="{{smallGraphsMinimumYAxis.queueLength}}" avg-label-color="#EA7E00" metric-suffix="MSGS" class="graph queue-length pull-left"></graph>
                                            </div>
                                            <div class="no-side-padding sparkline-value">
                                                (endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : endpoint.metrics.queueLength.displayValue
                                                <strong ng-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" uib-tooltip="No metrics received or endpoint is not configured to send metrics">?</strong>
                                                <strong ng-if="endpoint.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                        <div class="row box-header">
                                            <div class="no-side-padding">
                                                <graph plot-data="endpoint.metrics.throughput" minimum-YAxis="{{smallGraphsMinimumYAxis.throughput}}" avg-label-color="#176397" metric-suffix="MSGS/S" class="graph throughput pull-left"></graph>
                                            </div>
                                            <div class="no-side-padding sparkline-value">
                                                (endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : endpoint.metrics.throughput.displayValue
                                                <strong ng-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" uib-tooltip="No metrics received or endpoint is not configured to send metrics">?</strong>
                                                <strong ng-if="endpoint.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                        <div class="row box-header">
                                            <div class="no-side-padding">
                                                <graph plot-data="endpoint.metrics.retries" minimum-YAxis="{{smallGraphsMinimumYAxis.retries}}" avg-label-color="#CC1252" metric-suffix="MSGS/S" class="graph retries pull-left"></graph>
                                            </div>
                                            <div class="no-side-padding sparkline-value">
                                                (endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : endpoint.metrics.retries.displayValue
                                                <strong ng-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" uib-tooltip="No metrics received or endpoint is not configured to send metrics">?</strong>
                                                <strong ng-if="endpoint.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                        <div class="row box-header">
                                            <div class="no-side-padding">
                                                <graph plot-data="endpoint.metrics.processingTime" minimum-YAxis="{{smallGraphsMinimumYAxis.processingTime}}" avg-label-color="#258135" is-duration-graph="true" class="graph processing-time pull-left"></graph>
                                            </div>
                                            <div class="no-side-padding sparkline-value" ng-class="endpoint.metrics.processingTime.displayValue.unit">
                                                (endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : endpoint.metrics.processingTime.displayValue.value}}
                                                <strong ng-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" uib-tooltip="No metrics received or endpoint is not configured to send metrics">?</strong>
                                                <strong ng-if="endpoint.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                                <span ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="unit"> endpoint.metrics.processingTime.displayValue.unit}}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-xs-2 col-xl-1 no-side-padding">
                                        <div class="row box-header">
                                            <div class="no-side-padding">
                                                <graph plot-data="endpoint.metrics.criticalTime" minimum-YAxis="{{smallGraphsMinimumYAxis.criticalTime}}" avg-label-color="#2700CB" is-duration-graph="true" class="graph critical-time pull-left"></graph>
                                            </div>
                                            <div class="no-side-padding sparkline-value" ng-class="[endpoint.metrics.criticalTime.displayValue.unit, {'negative':endpoint.metrics.criticalTime.displayValue.value < 0}]">
                                                (endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true) ? "" : endpoint.metrics.criticalTime.displayValue.value}}
                                                <strong ng-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" uib-tooltip="No metrics received or endpoint is not configured to send metrics">?</strong>
                                                <strong ng-if="endpoint.isScMonitoringDisconnected" uib-tooltip="Unable to connect to monitoring server">?</strong>
                                                <span ng-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="unit"> endpoint.metrics.criticalTime.displayValue.unit}}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </template>
        </div>
    </template>
</template>
<style>
.form-control-static {
  min-height: 34px;
  padding-top: 7px;
  padding-bottom: 7px;
  margin-bottom: 0;
}

.filter-group.filter-monitoring {
  width: 100%;
}

.filter-group.filter-monitoring input {
  margin-top: 33px;
  float: none;
  font-size: 14px;
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
  font-family: "FontAwesome";
  width: 20px;
  content: "\f0b0";
  color: #919e9e;
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

.nav {
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
}

.nav.nav-pills.period-selector {
  display: inline-block;
  position: relative;
  top: 30px;
}

.nav > li {
  position: relative;
  display: block;
}

.nav-pills > li {
  float: left;
}

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
</style>

