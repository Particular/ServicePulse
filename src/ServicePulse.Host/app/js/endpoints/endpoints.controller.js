(function (window, angular, undefined) {
    'use strict';

    function controller ($scope, serviceControlService, $timeout) {

        var timeoutId;

        $scope.model = { active: [], inactive: [] };

        $scope.$on('$destroy', function () {
            $timeout.cancel(timeoutId);
        });

        function updateUI() {
            serviceControlService.getEndpoints().then(function (endpoints) {
                $scope.model.active = [];
                $scope.model.inactive = [];

                for (var j = 0; j < endpoints.length; j++) {
                    var item = endpoints[j];

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
        '$scope', 'serviceControlService', '$timeout',
    ];

    angular.module('endpoints')
        .controller('EndpointsCtrl', controller );

}(window, window.angular));