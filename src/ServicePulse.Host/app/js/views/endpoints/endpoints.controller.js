;
(function(window, angular, undefined) {

    'use strict';

    function controller(
        $scope,
        $timeout,
        sharedDataService,
        configurationService) {

        var timeoutId;

 
        $scope.model = { active: [], inactive: [] };

        $scope.$on('$destroy', function() {
            $timeout.cancel(timeoutId);
        });

        function updateUI() {
            configurationService.getData().then(function(endpoints) {

                var endpointList = endpoints.data;

                // remove unmonitored
                var unmonitored = endpointList.filter(function(umi) {
                    return !umi.monitor_heartbeat;
                });

                var i, obj;

                for (i = 0; i < $scope.model.active.length; i++) {
                    obj = $scope.model.active[i];
                    if (unmonitored.indexOf(obj.id) !== -1) {
                        $scope.model.active.splice(i, 1);
                        i--; // we just made the array 1 shorter
                    }
                }

                for (i = 0; i < $scope.model.inactive.length; i++) {
                    obj = $scope.model.inactive[i];
                    if (unmonitored.indexOf(obj.id) !== -1) {
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

                    if (item.hasOwnProperty('heartbeat_information') && item.heartbeat_information.reported_status === 'beating') {
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

                timeoutId = $timeout(function() {
                    updateUI();
                }, 5000);
            });
        }

        updateUI();
    };

    controller.$inject = [
        '$scope',
        '$timeout',
        'sharedDataService',
        'configurationService'
    ];

    angular.module('endpoints')
        .controller('EndpointsCtrl', controller);

}(window, window.angular));