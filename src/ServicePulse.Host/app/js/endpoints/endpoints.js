'use strict';

angular.module('endpoints', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/endpoints', { templateUrl: 'js/endpoints/endpoints.tpl.html', controller: 'EndpointsCtrl' });
    }])
    .controller('EndpointsCtrl', ['$scope', 'serviceControlService', 'streamService', function ($scope, serviceControlService, streamService) {

        $scope.model = [];

        serviceControlService.getHeartbeatsList().then(function (heartbeats) {
            $scope.model = heartbeats;
        });

        streamService.subscribe($scope, 'EndpointFailedToHeartbeat', function (message) {
            processMessage(message, false, message.last_received_at);
        });

        streamService.subscribe($scope, 'EndpointHeartbeatRestored', function (message) {
            processMessage(message, true, message.restored_at);
        });

        streamService.subscribe($scope, 'HeartbeatingEndpointDetected', function (message) {
            processMessage(message, true, message.detected_at);
        });

        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'EndpointFailedToHeartbeat');
            streamService.unsubscribe($scope, 'HeartbeatingEndpointDetected');
            streamService.unsubscribe($scope, 'EndpointHeartbeatRestored');
        });

        function processMessage(message, active, lastUpdatedAt) {
            var idx = findHeartbeat(message.endpoint, message.machine);

            if (idx == -1) {
                $scope.model.push(angular.extend({ active: active, last_sent_at: lastUpdatedAt }, message));
            } else {
                $scope.model[idx].active = active;
                $scope.model[idx].last_sent_at = lastUpdatedAt;
            }
        }

        function findHeartbeat(endpoint, machine) {
            for (var i = 0; i < $scope.model.length; i++) {
                if ($scope.model[i].endpoint === endpoint && $scope.model[i].machine === machine) {
                    return i;
                }
            }

            return -1;
        };
    }]);