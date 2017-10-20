/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function (window, angular, undefined) {
    'use strict';

    angular.module('monitored_endpoints', []);

    __webpack_require__(2);
    __webpack_require__(3);
})(window, window.angular);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(0);
__webpack_require__(0);
__webpack_require__(5);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function (window, angular, undefined) {
    'use strict';

    function controller($scope, $location, monitoringService, serviceControlService, toastService, historyPeriods, rx, formatter) {

        var subscription, endpointsFromScSubscription;

        $scope.periods = historyPeriods;
        $scope.selectedPeriod = $scope.periods[0];

        if ($location.$$search.historyPeriod) {
            $scope.selectedPeriod = $scope.periods[$scope.periods.findIndex(function (period) {
                return period.value == $location.$$search.historyPeriod;
            })];
        }

        $scope.endpoints = [];

        $scope.selectPeriod = function (period) {
            $scope.selectedPeriod = period;

            updateUI();
        };

        $scope.getDetailsUrl = function (endpoint) {
            if (!endpoint.isServiceControlOnly) {
                return '#/endpoint_details/' + endpoint.name + '/' + endpoint.sourceIndex + '?historyPeriod=' + $scope.selectedPeriod.value;
            }

            return '#/failed-messages/groups/' + endpoint.serviceControlId;
        };

        function updateUI() {
            if (subscription) {
                subscription.dispose();
            }

            if (endpointsFromScSubscription) {
                endpointsFromScSubscription.dispose();
            }

            subscription = monitoringService.createEndpointsSource($scope.selectedPeriod.value).subscribe(function (endpoint) {
                var index = $scope.endpoints.findIndex(function (item) {
                    return item.name === endpoint.name;
                });

                endpoint.isConnected = true;
                if (index >= 0) {
                    $scope.endpoints[index] = endpoint;
                } else {
                    $scope.endpoints.push(endpoint);

                    $scope.endpoints.sort(function (first, second) {
                        if (first.name < second.name) {
                            return -1;
                        }

                        if (first.name > second.name) {
                            return 1;
                        }

                        return 0;
                    });
                }

                $scope.$apply();
            });

            endpointsFromScSubscription = Rx.Observable.interval(5000).flatMap(function (i) {
                return Rx.Observable.fromPromise(serviceControlService.getExceptionGroups('Endpoint Name', null));
            }).selectMany(function (endpoints) {
                return endpoints.data;
            }).subscribe(function (endpoint) {
                var index = $scope.endpoints.findIndex(function (item) {
                    return item.name === endpoint.title;
                });
                if (index >= 0) {
                    $scope.endpoints[index].errorCount = endpoint.count;
                } else {
                    $scope.endpoints.push({ name: endpoint.title, errorCount: endpoint.count, isConnected: false, isServiceControlOnly: true, serviceControlId: endpoint.id });
                }
            });
        }

        updateUI();

        $scope.$on("$destroy", function handler() {
            subscription.dispose();
            endpointsFromScSubscription.dispose();
        });
    };

    controller.$inject = ['$scope', '$location', 'monitoringService', 'serviceControlService', 'toastService', 'historyPeriods', 'rx', 'formatter'];

    angular.module('monitored_endpoints').controller('monitoredEndpointsCtrl', controller);
})(window, window.angular);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        var template = __webpack_require__(4);

        $routeProvider.when('/monitored_endpoints', {
            data: {
                pageTitle: 'Monitored Endpoints'
            },
            template: template,
            controller: 'monitoredEndpointsCtrl',
            controllerAs: 'vm',
            reloadOnSearch: false
        });
    };

    routeProvider.$inject = ['$routeProvider'];

    angular.module('monitored_endpoints').config(routeProvider);
})(window, window.angular);

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = "<div class=\"container\" ng-show=\"endpoints.length\">\r\n    <div class=\"row monitoring-head\">\r\n        <div class=\"col-sm-10 no-side-padding list-section\">\r\n            <h1>Endpoints overview</h1>\r\n        </div>\r\n        <div class=\"col-sm-2 no-side-padding toolbar-menus\">\r\n            <div class=\"msg-group-menu dropdown\">\r\n                <label class=\"control-label\">Period:</label>\r\n                <button type=\"button\" class=\"btn btn-default dropdown-toggle sp-btn-menu\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\r\n                    {{selectedPeriod.text}}\r\n                    <span class=\"caret\"></span>\r\n                </button>\r\n                <ul class=\"dropdown-menu\">\r\n                    <li ng-repeat=\"period in periods\">\r\n                        <a ng-click=\"selectPeriod(period)\" href=\"#/monitored_endpoints?historyPeriod={{period.value}}\">{{period.text}}</a>\r\n                    </li>\r\n                </ul>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n<div class=\"container\">\r\n    <section ng-show=\"true\">\r\n        <div class=\"text-center monitoring-no-data\" ng-show=\"!endpoints.length\">\r\n            <h1>No endpoints available for monitoring</h1>\r\n                <p>Ensure that your endpoints have auditing enabled and/or have the metrics plug-in enabled</p>\r\n            <div class=\"action-toolbar\">\r\n                <a class=\"btn btn-default btn-primary\" href=\"https://www.google.com/search?site=&source=hp&q=metrics+%2Fsite%3Adocs.particular.net&oq=metrics+%2Fsite%3Adocs.particular.net\">Learn more</a>\r\n            </div>\r\n        </div>\r\n        \r\n        <div ng-show=\"endpoints.length\" class=\"row box box-no-click table-head-row\">\r\n            <div class=\"col-sm-2 col-xl-7\">\r\n                <div class=\"row box-header\">\r\n                    <div class=\"col-sm-12\">\r\n                        <p>Name</p>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n            <div class=\"col-sm-2 col-xl-1 no-side-padding\">\r\n                <div class=\"row box-header\">\r\n                    <div class=\"col-sm-12 no-side-padding\" uib-tooltip=\"Queue Length (msgs): Estimated number of messages in the endpoint queue.\">\r\n                        <p>Queue Length <span>(msgs)</span></p>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n            <div class=\"col-sm-2 col-xl-1 no-side-padding\" uib-tooltip=\"Throughput (msgs/sec): The number of successfully processed messages per second.\">\r\n                <div class=\"row box-header\">\r\n                    <div class=\"col-sm-12 no-side-padding\">\r\n                        <p>Throughput <span>(msgs/sec)</span></p>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n            <div class=\"col-sm-2 col-xl-1 no-side-padding\" uib-tooltip=\"Scheduled retry rate (msgs/sec): Retries (immediate and delayed) scheduled per second, excluding moving to error queue.\">\r\n                <div class=\"row box-header\">\r\n                    <div class=\"col-sm-12 no-side-padding\">\r\n                        <p>Scheduled retry rate <span>(msgs/sec)</span></p>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n            <div class=\"col-sm-2 col-xl-1 no-side-padding\" uib-tooltip=\"Processing time (t): Time spent in the processing pipeline or the receiver for successfully processed messages.\">\r\n                <div class=\"row box-header\">\r\n                    <div class=\"col-sm-12 no-side-padding\">\r\n                        <p>Processing Time <span>(t)</span></p>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n            <div class=\"col-sm-2 col-xl-1 no-side-padding\" uib-tooltip=\"Critical time (t): Time between the message being generated at the sender and successfully processed, captured at the receiver.\">\r\n                <div class=\"row box-header\">\r\n                    <div class=\"col-sm-12 no-side-padding\">\r\n                        <p>Critical Time <span>(t)</span></p>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n\r\n        <div class=\"row\">\r\n            <div class=\"col-sm-12 no-side-padding\">\r\n                <div class=\"row box endpoint-row box-group\" ng-repeat=\"endpoint in endpoints\" ng-mouseenter=\"endpoint.hover1=true\" ng-mouseleave=\"endpoint.hover1=false\">\r\n                    <div class=\"col-sm-12 no-side-padding\">\r\n                        <div class=\"row\">\r\n                            <a class=\"hard-wrap lead\" ng-click=\"endpoint.isExpanded = !endpoint.isExpanded\" ng-href=\"{{getDetailsUrl(endpoint)}}\">\r\n                                <div class=\"col-sm-2 col-xl-7 endpoint-name\">\r\n                                    <div class=\"row box-header\">\r\n                                        <div class=\"col-sm-12 no-side-padding\">\r\n\r\n                                            {{endpoint.name}}\r\n                                            <span ng-if=\"endpoint.endpointInstanceIds.length && endpoint.endpointInstanceIds.length > 1\">({{endpoint.endpointInstanceIds.length}})</span>\r\n                                            <div class=\"endpoint-status\">\r\n                                                <span class=\"warning\" ng-if=\"endpoint.isStale\">\r\n                                                    <i class=\"fa fa-exclamation-triangle\" uib-tooltip=\"Endpoint does not appear to be connected to the monitoring server anymore\"></i>\r\n                                                </span>\r\n                                                <span class=\"warning\" ng-if=\"endpoint.errorCount\">\r\n                                                    <i class=\"fa fa-envelope\"></i>\r\n                                                    <span class=\"badge badge-important ng-binding\">{{endpoint.errorCount | largeNumber:1:\"\"}}</span>\r\n                                                </span>\r\n                                            </div>\r\n                                        </div>\r\n                                    </div>\r\n                                </div>\r\n                                <div class=\"col-sm-2 col-xl-1 no-side-padding\" ng-if=\"endpoint.isConnected\">\r\n                                    <div class=\"row box-header\">\r\n                                        <div class=\"col-sm-12 no-side-padding\">\r\n                                            <graph plot-data=\"endpoint.metrics.queueLength | graphdecimal\" color=\"#e09365\" class=\"graph pull-left\"></graph>\r\n                                            <span ng-if=\"endpoint.isStale\" class=\"warning graphicon\" ng-class=\"{'graphicon-row-hover': endpoint.hover1}\">\r\n                                                <i class=\"fa fa-exclamation-triangle\" uib-tooltip=\"Endpoint does not appear to be connected to the monitoring server anymore\"></i>\r\n                                            </span>\r\n                                        </div>\r\n                                    </div>\r\n                                </div>\r\n                                <div class=\"col-sm-2 col-xl-1 no-side-padding\" ng-if=\"endpoint.isConnected\">\r\n                                    <div class=\"row box-header\">\r\n                                        <div class=\"col-sm-12 no-side-padding\">\r\n                                            <graph plot-data=\"endpoint.metrics.throughput\" color=\"#e09365\" class=\"graph pull-left\"></graph>\r\n                                            <span ng-if=\"endpoint.isStale\" class=\"warning graphicon\" ng-class=\"{'graphicon-row-hover': endpoint.hover1}\">\r\n                                                <i class=\"fa fa-exclamation-triangle\" uib-tooltip=\"Endpoint does not appear to be connected to the monitoring server anymore\"></i>\r\n                                            </span>\r\n                                        </div>\r\n                                    </div>\r\n                                </div>\r\n                                <div class=\"col-sm-2 col-xl-1 no-side-padding\" ng-if=\"endpoint.isConnected\">\r\n                                    <div class=\"row box-header\">\r\n                                        <div class=\"col-sm-12 no-side-padding\">\r\n                                            <graph plot-data=\"endpoint.metrics.retries\" color=\"#4286f4\" class=\"graph pull-left\"></graph>\r\n                                            <span ng-if=\"endpoint.isStale\" class=\"warning graphicon\" ng-class=\"{'graphicon-row-hover': endpoint.hover1}\">\r\n                                                <i class=\"fa fa-exclamation-triangle\" uib-tooltip=\"Endpoint does not appear to be connected to the monitoring server anymore\"></i>\r\n                                            </span>\r\n                                        </div>\r\n                                    </div>\r\n                                </div>\r\n                                <div class=\"col-sm-2 col-xl-1 no-side-padding\" ng-if=\"endpoint.isConnected\">\r\n                                    <div class=\"row box-header\">\r\n                                        <div class=\"col-sm-12 no-side-padding\">\r\n                                            <graph plot-data=\"endpoint.metrics.processingTime | graphduration\" color=\"#40bc42\" class=\"graph pull-left\"></graph>\r\n                                            <span ng-if=\"endpoint.isStale\" class=\"warning graphicon\" ng-class=\"{'graphicon-row-hover': endpoint.hover1}\">\r\n                                                <i class=\"fa fa-exclamation-triangle\" uib-tooltip=\"Endpoint does not appear to be connected to the monitoring server anymore\"></i>\r\n                                            </span>\r\n                                        </div>\r\n                                    </div>\r\n                                </div>\r\n                                <div class=\"col-sm-2 col-xl-1 no-side-padding\" ng-if=\"endpoint.isConnected\">\r\n                                    <div class=\"row box-header\">\r\n                                        <div class=\"col-sm-12 no-side-padding\">\r\n                                            <graph plot-data=\"endpoint.metrics.criticalTime | graphduration\" color=\"#d64f21\" class=\"graph pull-left\"></graph>\r\n                                            <span ng-if=\"endpoint.isStale\" class=\"warning graphicon\" ng-class=\"{'graphicon-row-hover': endpoint.hover1}\">\r\n                                                <i class=\"fa fa-exclamation-triangle\" uib-tooltip=\"Endpoint does not appear to be connected to the monitoring server anymore\"></i>\r\n                                            </span>\r\n                                        </div>\r\n                                    </div>\r\n                                </div>\r\n                                \r\n                                <div class=\"col-sm-2 col-xl-1 no-side-padding\" ng-if=\"!endpoint.isConnected\">\r\n                                    <div class=\"row box-header\">\r\n                                        No plug-ins installed. \r\n                                    </div>\r\n                                </div>\r\n                            </a>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </section>\r\n</div>\r\n";

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function (window, angular, undefined) {
    'use strict';

    angular.module('endpoint_details', []);

    __webpack_require__(6);
    __webpack_require__(7);
})(window, window.angular);

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function (window, angular, undefined) {
    'use strict';

    function controller($scope, $routeParams, $location, toastService, serviceControlService, monitoringService, historyPeriods, formatter) {
        $scope.endpointName = $routeParams.endpointName;
        $scope.sourceIndex = $routeParams.sourceIndex;
        $scope.loading = true;
        $scope.showInstancesBreakdown = false;

        var subscription;

        $scope.periods = historyPeriods;
        $scope.selectedPeriod = $scope.periods[0];

        if ($location.$$search.historyPeriod) {
            $scope.selectedPeriod = $scope.periods[$scope.periods.findIndex(function (period) {
                return period.value == $location.$$search.historyPeriod;
            })];
        }

        $scope.selectPeriod = function (period) {
            $scope.selectedPeriod = period;

            updateUI();
        };

        function updateUI() {
            if (subscription) {
                subscription.dispose();
            }

            subscription = monitoringService.createEndpointDetailsSource($routeParams.endpointName, $routeParams.sourceIndex, $scope.selectedPeriod.value).subscribe(function (endpoint) {
                if (endpoint.error) {
                    toastService.showWarning('Could not load endpoint details');
                } else {
                    $scope.endpoint = endpoint;

                    $scope.endpoint.instances.sort(function (first, second) {
                        if (first.id < second.id) {
                            return -1;
                        }

                        if (first.id > second.id) {
                            return 1;
                        }

                        return 0;
                    });

                    $scope.loading = false;
                }

                $scope.endpoint.metricDetails.metrics.throughput.timeAxisValues = $scope.endpoint.metricDetails.metrics.throughput.timeAxisValues.map(function (item) {
                    var date = new Date(item);
                    return date.toLocaleTimeString();
                });
                endpoint.metricDetails.metrics.throughput.className = 'throughput';
                endpoint.metricDetails.metrics.throughput.unit = 'msgs/sec';
                endpoint.metricDetails.metrics.throughput.axisName = 'Throughput [' + endpoint.metricDetails.metrics.throughput.unit + ']';
                endpoint.metricDetails.metrics.queueLength.className = 'queue-length';
                endpoint.metricDetails.metrics.queueLength.unit = 'msgs';
                endpoint.metricDetails.metrics.queueLength.axisName = 'Queue Length [' + endpoint.metricDetails.metrics.queueLength.unit + ']';

                $scope.endpoint.instances.forEach(function (instance) {
                    serviceControlService.getExceptionGroupsForEndpointInstance(instance.id).then(function (result) {
                        if (result.data.length > 0) {
                            instance.serviceControlId = result.data[0].id;
                            instance.errorCount = result.data[0].count;
                        }
                    }, function (err) {
                        // Warn user?
                    });
                });
            });
        }

        $scope.$on("$destroy", function handler() {
            subscription.dispose();
        });

        updateUI();
    }

    controller.$inject = ['$scope', '$routeParams', '$location', 'toastService', 'serviceControlService', 'monitoringService', 'historyPeriods', 'formatter'];

    angular.module('endpoint_details').controller('endpointDetailsCtrl', controller);
})(window, window.angular);

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        var template = __webpack_require__(8);

        $routeProvider.when('/endpoint_details/:endpointName/:sourceIndex', {
            data: {
                pageTitle: 'Endpoint Details'
            },
            template: template,
            controller: 'endpointDetailsCtrl',
            controllerAs: 'vm',
            reloadOnSearch: false
        });
    };

    routeProvider.$inject = ['$routeProvider'];

    angular.module('endpoint_details').config(routeProvider);
})(window, window.angular);

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = "<div class=\"container\">\r\n    <div class=\"row\">\r\n        <div class=\"col-sm-10 no-side-padding list-section\">\r\n            <h6>{{endpointName}}</h6>\r\n        </div>\r\n        <div class=\"col-sm-2 no-side-padding toolbar-menus\">\r\n            <div class=\"msg-group-menu dropdown\">\r\n                <label class=\"control-label\">Period:</label>\r\n                <button type=\"button\" class=\"btn btn-default dropdown-toggle sp-btn-menu\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\r\n                    {{selectedPeriod.text}}\r\n                    <span class=\"caret\"></span>\r\n                </button>\r\n                <ul class=\"dropdown-menu\">\r\n                    <li ng-repeat=\"period in periods\">\r\n                        <a ng-click=\"selectPeriod(period)\" href=\"#/endpoint_details/{{endpointName}}/{{sourceIndex}}?historyPeriod={{period.value}}\">{{period.text}}</a>\r\n                    </li>\r\n                </ul>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n<hr/>\r\n\r\n<div class=\"container\">\r\n    <div class=\"row\">\r\n        <div class=\"col-sm-9 no-side-padding list-section\">\r\n            <!-- here goes diagram -->\r\n            <large-graph ng-if=\"endpoint.metricDetails.metrics.throughput\" first-data-series=\"endpoint.metricDetails.metrics.throughput\" second-data-series=\"endpoint.metricDetails.metrics.queueLength\" xAxis-points=\"endpoint.metricDetails.metrics.throughput.timeAxisValues\" plot-width=\"1240\" plot-height=\"600\" first-series-color=\"#e09365\" second-series-color=\"#4286f4\" class=\"large-graph pull-left\"></large-graph>\r\n        </div>\r\n\r\n        <div class=\"col-sm-3 no-side-padding toolbar-menus\">\r\n            <div class=\"row\">\r\n                <div class=\"col-sm-6\"><p class=\"lead text-left\">Current</p></div>\r\n                <div class=\"col-sm-6\"><p class=\"lead text-left\">Average</p></div>\r\n            </div>\r\n\r\n            <div class=\"row\">\r\n                <div class=\"col-sm-6 metric-digest\"><span class=\"metric-digest-header\">Queue Length</span><span class=\"metric-digest-value\">{{endpoint.digest.metrics.queueLength.latest | number:0}} msgs</span></div>\r\n                <div class=\"col-sm-6 metric-digest\"><span class=\"metric-digest-header\">Queue Length</span><span class=\"metric-digest-value\">{{endpoint.digest.metrics.queueLength.average | number:0}} msgs</span></div>\r\n            </div>\r\n            \r\n            <div class=\"row\">\r\n                <div class=\"col-sm-6 metric-digest\"><span class=\"metric-digest-header\">Throughput</span><span class=\"metric-digest-value\">{{endpoint.digest.metrics.throughput.latest | number:2}} msgs/s</span></div>\r\n                <div class=\"col-sm-6 metric-digest\"><span class=\"metric-digest-header\">Throughput</span><span class=\"metric-digest-value\">{{endpoint.digest.metrics.throughput.average | number:2}} msgs/s</span></div>\r\n            </div>\r\n            \r\n            <div class=\"row\">\r\n                <div class=\"col-sm-6 metric-digest\"><span class=\"metric-digest-header\">Scheduled retry rate</span><span class=\"metric-digest-value\">{{endpoint.digest.metrics.retries.latest | number:2}} msgs</span></div>\r\n                <div class=\"col-sm-6 metric-digest\"><span class=\"metric-digest-header\">Scheduled retry rate</span><span class=\"metric-digest-value\">{{endpoint.digest.metrics.retries.average | number:2}} msgs</span></div>\r\n            </div>\r\n\r\n            <div class=\"row\">\r\n                <div class=\"col-sm-6 metric-digest\"><span class=\"metric-digest-header\">Processing Time</span><span class=\"metric-digest-value\">{{endpoint.digest.metrics.processingTime.latest | duration}}</span></div>\r\n                <div class=\"col-sm-6 metric-digest\"><span class=\"metric-digest-header\">Processing Time</span><span class=\"metric-digest-value\">{{endpoint.digest.metrics.processingTime.average | duration}}</span></div>\r\n            </div>\r\n\r\n            <div class=\"row\">\r\n                <div class=\"col-sm-6 metric-digest\"><span class=\"metric-digest-header\">Critical Time</span><span class=\"metric-digest-value\">{{endpoint.digest.metrics.criticalTime.latest | duration}}</span></div>\r\n                <div class=\"col-sm-6 metric-digest\"><span class=\"metric-digest-header\">Critical Time</span><span class=\"metric-digest-value\">{{endpoint.digest.metrics.criticalTime.average | duration}}</span></div>\r\n            </div>\r\n            \r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n<div class=\"container\">\r\n    <busy ng-show=\"loading\" message=\"Loading details\"></busy>\r\n    <div class=\"tabs\">\r\n        <h5 ng-class=\"{active: !showInstancesBreakdown}\">\r\n            <a ng-click=\"showInstancesBreakdown = false\" class=\"ng-binding\">Message Types</a>\r\n        </h5>\r\n        <h5 ng-class=\"{active: showInstancesBreakdown}\">\r\n            <a ng-click=\"showInstancesBreakdown = true\" class=\"ng-binding\">Instances</a>\r\n        </h5>\r\n    </div>\r\n\r\n    <section ng-if=\"showInstancesBreakdown\">\r\n        <div class=\"row\">\r\n            <div class=\"col-sm-12 no-side-padding\">\r\n\r\n                <!-- Breakdown by instance -->\r\n                <busy ng-show=\"loading\" message=\"Loading details\"></busy>\r\n\r\n                <div ng-show=\"!loading\" class=\"row box box-no-click\">\r\n                    <div class=\"col-sm-4 no-side-padding\">\r\n                        <div class=\"row box-header\">\r\n                            <div class=\"col-sm-12 no-side-padding\">\r\n                                <p class=\"lead\">Instance Name</p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"col-sm-2 no-side-padding\">\r\n                        <div class=\"row box-header\">\r\n                            <div class=\"col-sm-12 no-side-padding\" uib-tooltip=\"Throughput (msgs/sec): The number of successfully processed messages per second.\">\r\n                                <p class=\"lead\">Throughput (msgs/sec)</p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"col-sm-2 no-side-padding\">\r\n                        <div class=\"row box-header\">\r\n                            <div class=\"col-sm-12 no-side-padding\" uib-tooltip=\"Scheduled retry rate (msgs/sec): Retries (immediate and delayed) scheduled per second, excluding moving to error queue.\">\r\n                                <p class=\"lead\">Scheduled retry rate (msgs/sec)</p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"col-sm-2 no-side-padding\">\r\n                        <div class=\"row box-header\">\r\n                            <div class=\"col-sm-12 no-side-padding\" uib-tooltip=\"Processing time (t): Time spent in the processing pipeline or the receiver for successfully processed messages.\">\r\n                                <p class=\"lead\">Processing Time (t) </p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"col-sm-2 no-side-padding\">\r\n                        <div class=\"row box-header\">\r\n                            <div class=\"col-sm-12 no-side-padding\" uib-tooltip=\"Critical time (t): Time between the message being generated at the sender and successfully processed, captured at the receiver.\">\r\n                                <p class=\"lead\">Critical Time (t) </p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n\r\n                <div class=\"row\">\r\n                    <div class=\"col-sm-12 no-side-padding\">\r\n                        <div class=\"row box box-no-click\" ng-repeat=\"instance in endpoint.instances\">\r\n                            <div class=\"col-sm-12 no-side-padding\">\r\n                                <div class=\"row endpoint-row\">\r\n                                    <div class=\"col-sm-4 no-side-padding\">\r\n                                        <div class=\"row box-header\">\r\n                                            <div class=\"col-sm-12 no-side-padding\">\r\n                                                <div class=\"hard-wrap\">\r\n                                                    {{instance.id}}\r\n                                                    <a ng-if=\"instance.errorCount\" class=\"warning btn\" href=\"#/failed-messages/groups/{{endpointName}}/{{sourceIndex}}/{{instance.serviceControlId}}\">\r\n                                                        <i class=\"fa fa-envelope\"></i>\r\n                                                        <span class=\"badge badge-important ng-binding\">{{instance.errorCount | largeNumber:1}}</span>\r\n                                                        <span ng-if=\"instance.isStale\" class=\"warning pull-right\">\r\n                                                            <i class=\"fa fa-exclamation-triangle\" uib-tooltip=\"Endpoint does not appear to be connected to the monitoring server anymore\"></i>\r\n                                                        </span>\r\n                                                    </a>\r\n                                                </div>\r\n                                            </div>\r\n                                        </div>\r\n                                    </div>\r\n                                    <div class=\"col-sm-2 no-side-padding\">\r\n                                        <div class=\"row box-header\">\r\n                                            <div class=\"col-sm-12 no-side-padding\">\r\n                                                <graph plot-data=\"instance.metrics.throughput\" color=\"#e09365\" class=\"graph pull-left\"></graph>\r\n                                                <span ng-if=\"instance.isStale\" class=\"warning pull-right graphicon\">\r\n                                                    <i class=\"fa fa-exclamation-triangle\" uib-tooltip=\"Endpoint does not appear to be connected to the monitoring server anymore\"></i>\r\n                                                </span>\r\n                                            </div>\r\n                                        </div>\r\n                                    </div>\r\n                                    <div class=\"col-sm-2 no-side-padding\">\r\n                                        <div class=\"row box-header\">\r\n                                            <div class=\"col-sm-12 no-side-padding\">\r\n                                                <graph plot-data=\"instance.metrics.retries\" color=\"#4286f4\" class=\"graph pull-left\"></graph>\r\n                                                <span ng-if=\"instance.isStale\" class=\"warning pull-right graphicon\">\r\n                                                    <i class=\"fa fa-exclamation-triangle\" uib-tooltip=\"Endpoint does not appear to be connected to the monitoring server anymore\"></i>\r\n                                                </span>\r\n                                            </div>\r\n                                        </div>\r\n                                    </div>\r\n                                    <div class=\"col-sm-2 no-side-padding\">\r\n                                        <div class=\"row box-header\">\r\n                                            <div class=\"col-sm-12 no-side-padding\">\r\n                                                <graph plot-data=\"instance.metrics.processingTime | graphduration\" color=\"#40bc42\" class=\"graph pull-left\"></graph>\r\n                                                <span ng-if=\"instance.isStale\" class=\"warning pull-right graphicon\">\r\n                                                    <i class=\"fa fa-exclamation-triangle\" uib-tooltip=\"Endpoint does not appear to be connected to the monitoring server anymore\"></i>\r\n                                                </span>\r\n                                            </div>\r\n                                        </div>\r\n                                    </div>\r\n                                    <div class=\"col-sm-2 no-side-padding\">\r\n                                        <div class=\"row box-header\">\r\n                                            <div class=\"col-sm-12 no-side-padding\">\r\n                                                <graph plot-data=\"instance.metrics.criticalTime | graphduration\" color=\"#d64f21\" class=\"graph pull-left\"></graph>\r\n                                                <span ng-if=\"instance.isStale\" class=\"warning pull-right graphicon\">\r\n                                                    <i class=\"fa fa-exclamation-triangle\" uib-tooltip=\"Endpoint does not appear to be connected to the monitoring server anymore\"></i>\r\n                                                </span>\r\n                                            </div>\r\n                                        </div>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n\r\n        </div>\r\n    </section>\r\n\r\n    <section ng-if=\"!showInstancesBreakdown\">\r\n        <div class=\"row\">\r\n            <div class=\"col-sm-12 no-side-padding\">\r\n                <!-- Breakdown by message type-->\r\n                <busy ng-show=\"loading\" message=\"Loading details\"></busy>\r\n\r\n                <div ng-show=\"!loading\" class=\"row box box-no-click\">\r\n                    <div class=\"col-sm-4 no-side-padding\">\r\n                        <div class=\"row box-header\">\r\n                            <div class=\"col-sm-12 no-side-padding\">\r\n                                <p class=\"lead\">Message Type</p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"col-sm-2 no-side-padding\">\r\n                        <div class=\"row box-header\">\r\n                            <div class=\"col-sm-12 no-side-padding\" uib-tooltip=\"Throughput (msgs/sec): The number of successfully processed messages per second.\">\r\n                                <p class=\"lead\">Throughput (msgs/sec)</p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"col-sm-2 no-side-padding\">\r\n                        <div class=\"row box-header\">\r\n                            <div class=\"col-sm-12 no-side-padding\" uib-tooltip=\"Scheduled retry rate (msgs/sec): Retries (immediate and delayed) scheduled per second, excluding moving to error queue.\">\r\n                                <p class=\"lead\">Scheduled retry rate (msgs/sec)</p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"col-sm-2 no-side-padding\">\r\n                        <div class=\"row box-header\">\r\n                            <div class=\"col-sm-12 no-side-padding\" uib-tooltip=\"Processing time (t): Time spent in the processing pipeline or the receiver for successfully processed messages.\">\r\n                                <p class=\"lead\">Processing Time (t) </p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"col-sm-2 no-side-padding\">\r\n                        <div class=\"row box-header\">\r\n                            <div class=\"col-sm-12 no-side-padding\" uib-tooltip=\"Critical time (t): Time between the message being generated at the sender and successfully processed, captured at the receiver.\">\r\n                                <p class=\"lead\">Critical Time (t) </p>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n\r\n                <div class=\"row\">\r\n                    <div class=\"col-sm-12 no-side-padding\">\r\n                        <div class=\"row box box-no-click\" ng-repeat=\"messageType in endpoint.messageTypes\">\r\n                            <div class=\"col-sm-12 no-side-padding\">\r\n                                <div class=\"row endpoint-row\">\r\n                                    <div class=\"col-sm-4 no-side-padding\">\r\n                                        <div class=\"row box-header\">\r\n                                            <div class=\"col-sm-12 no-side-padding\">\r\n                                                <div class=\"hard-wrap\">\r\n                                                    {{messageType.messageType}}\r\n                                                </div>\r\n                                            </div>\r\n                                        </div>\r\n                                    </div>\r\n                                    <div class=\"col-sm-2 no-side-padding\">\r\n                                        <div class=\"row box-header\">\r\n                                            <div class=\"col-sm-12 no-side-padding\">\r\n                                                <graph plot-data=\"messageType.metrics.throughput\" color=\"#e09365\" class=\"graph pull-left\"></graph>\r\n                                            </div>\r\n                                        </div>\r\n                                    </div>\r\n                                    <div class=\"col-sm-2 no-side-padding\">\r\n                                        <div class=\"row box-header\">\r\n                                            <div class=\"col-sm-12 no-side-padding\">\r\n                                                <graph plot-data=\"messageType.metrics.retries\" color=\"#4286f4\" class=\"graph pull-left\"></graph>\r\n                                            </div>\r\n                                        </div>\r\n                                    </div>\r\n                                    <div class=\"col-sm-2 no-side-padding\">\r\n                                        <div class=\"row box-header\">\r\n                                            <div class=\"col-sm-12 no-side-padding\">\r\n                                                <graph plot-data=\"messageType.metrics.processingTime | graphduration\" color=\"#40bc42\" class=\"graph pull-left\"></graph>\r\n                                            </div>\r\n                                        </div>\r\n                                    </div>\r\n                                    <div class=\"col-sm-2 no-side-padding\">\r\n                                        <div class=\"row box-header\">\r\n                                            <div class=\"col-sm-12 no-side-padding\">\r\n                                                <graph plot-data=\"messageType.metrics.criticalTime | graphduration\" color=\"#d64f21\" class=\"graph pull-left\"></graph>\r\n                                            </div>\r\n                                        </div>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </section>\r\n</div>";

/***/ })
/******/ ]);