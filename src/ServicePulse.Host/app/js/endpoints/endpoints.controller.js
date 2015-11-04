; (function (window, angular, undefined) {

    'use strict';

    function controller($scope, $timeout, configurationService) {

        var timeoutId;

        $scope.model = { active: [], inactive: [] };

        $scope.$on('$destroy', function () {
            $timeout.cancel(timeoutId);
        });

        function updateUI() {
            configurationService.getData().then(function (endpoints) {
                $scope.model.active = [];
                $scope.model.inactive = [];

                var endpointList = endpoints.data;

                for (var j = 0; j < endpointList.length; j++) {
                    var item = endpointList[j];

                    if (!item.monitor_heartbeat) {
                        continue;
                    }

                    if (item.hasOwnProperty('heartbeat_information') && item.heartbeat_information.reported_status === 'beating') {
                        $scope.model.active.push(item);
                    } else {
                        $scope.model.inactive.push(item);
                    }
                }

                timeoutId = $timeout(function () {
                    updateUI();
                }, 5000);
            });
        }

        updateUI();
    };

    controller.$inject = [
        '$scope', '$timeout' , 'configurationService'
    ];

    angular.module('endpoints')
        .controller('EndpointsCtrl', controller);

} (window, window.angular));