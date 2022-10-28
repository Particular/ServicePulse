(function(window, angular, $) {
    'use strict';

    function createWorkflowState(optionalStatus, optionalMessage) {
        return {
            status: optionalStatus || 'working',
            message: optionalMessage || 'working'
        };
    }

    function controller(
        $scope,
        $interval,
        sharedDataService,
        configurationService,
        notifyService) {

        var notifier = notifyService();
 
        $scope.model = { active: [], inactive: [], endpoints: [] };

        $scope.sortOptions = ['Name', 'Latest heartbeat'];
        $scope.sort = 'Name';
        $scope.sortDir = '';

        $scope.isInactiveEndpoints = true;

        $scope.$on('$destroy', function() {
            $interval.cancel(timeoutId);
        });

        var timeoutId = $interval(function() {
            updateUI();
        }, 5000);

        function updateUI() {
            configurationService.getEndpoints().then(function(endpoints) {
                var endpointList = endpoints.data;

                // remove unmonitored
                var unmonitored = endpointList.filter(function(umi) {
                    return !umi.monitor_heartbeat;
                });

                var i, obj;

                for (i = 0; i < $scope.model.active.length; i++) {
                    obj = $scope.model.active[i];
                    if (unmonitored.find(function (endpoint) { return endpoint.id == obj.id; }) !== -1) {
                        $scope.model.active.splice(i, 1);
                        i--; // we just made the array 1 shorter
                    }
                }

                for (i = 0; i < $scope.model.inactive.length; i++) {
                    obj = $scope.model.inactive[i];
                    if (unmonitored.find(function (endpoint) { return endpoint.id == obj.id; }) !== -1) {
                        $scope.model.inactive.splice(i, 1);
                        i--;
                    }
                }

                var monitored = endpointList.filter(function(mi) {
                    return mi.monitor_heartbeat;
                });

                for (var j = 0; j < monitored.length; j++) {
                    var item = monitored[j];

                    var activeIndex = $scope.model.active.map(function(bi) { return bi.id; }).indexOf(item.id);
                    var inactiveIndex = $scope.model.inactive.map(function(bi) { return bi.id; }).indexOf(item.id);

                    if (Object.prototype.hasOwnProperty.call(item, 'heartbeat_information') && item.heartbeat_information.reported_status === 'beating') {
                        if (activeIndex === -1) {
                            $scope.model.active.push(item);
                        } else {
                            var activeitem = $scope.model.active[activeIndex];
                            activeitem.heartbeat_information.last_report_at = item.heartbeat_information.last_report_at;
                        }
                        if (inactiveIndex !== -1) {
                            $scope.model.inactive.splice(inactiveIndex, 1);
                        }
                    } else {
                        if (inactiveIndex === -1) {
                            $scope.model.inactive.push(item);
                        }
                        if (activeIndex !== -1) {
                            $scope.model.active.splice(activeIndex, 1);
                        }

                    }
                }

                var sort = getSortFunction();

                $scope.model.inactive.sort(sort);
                $scope.model.active.sort(sort);
            });
        }

        $scope.deleteEndpoint = function(endpoint) {
            configurationService.deleteEndpoint(endpoint.id).then(function() {
                $scope.model.inactive.splice($scope.model.inactive.indexOf(endpoint), 1);
            });
        }

        function autoGetEndPoints() {
            configurationService.getEndpoints()
                .then(function(response) {
                    notifier.notify('EndpointCountUpdated', response.data.length);

                    if (response.data.length > 0) {
                        // need a map in some ui state for controlling animations
                        var endPoints = response.data.map(function(obj) {
                            var nObj = obj;
                            nObj.workflow_state = createWorkflowState('ready', '');
                            return nObj;
                        });

                        $scope.model.endpoints = endPoints;
                        $scope.model.endpoints.sort(getSortFunction());
                    }
                });
        }

        $scope.update = function (id, monitor) {
            var result = $.grep($scope.model.endpoints, function (e) {
                return e.id === id;
            })[0];

            result.workflow_state = createWorkflowState('working', 'Updating');
         
            configurationService.update(id, monitor, 'Updating', 'Update Failed')
                .then(function(message) {
                    result.workflow_state = createWorkflowState('ready', message);
                    result.monitor_heartbeat = monitor;
                }, function(message) {
                    result.workflow_state = createWorkflowState('error', message);
                });
        };

        $scope.changeSort = function(sortBy, sortDir) {
            $scope.sort = sortBy;
            $scope.sortDir = sortDir === 'asc' ? '' : ' (Descending)';

            var sort = getSortFunction();

            $scope.model.inactive.sort(sort);
            $scope.model.active.sort(sort);
            $scope.model.endpoints.sort(sort);
        };

        var getSortFunction = function() {
            var multiplier = -1;
            if ($scope.sortDir === ' (Descending)') {
                multiplier = 1;
            }

            if ($scope.sort === 'Latest heartbeat') {
                return function (firstElement, secondElement) {
                    return firstElement.heartbeat_information.last_report_at < secondElement.heartbeat_information.last_report_at ? multiplier : -multiplier;
                };
            }

            return function (firstElement, secondElement) {
                return firstElement.name.toLowerCase() < secondElement.name.toLowerCase() ? multiplier : -multiplier;
            };
        };

        autoGetEndPoints();

        updateUI();
    }

    controller.$inject = [
        '$scope',
        '$interval',
        'sharedDataService',
        'configurationService',
        'notifyService'
    ];

    angular.module('endpoints')
        .controller('EndpointsCtrl', controller);

}(window, window.angular, window.jQuery));