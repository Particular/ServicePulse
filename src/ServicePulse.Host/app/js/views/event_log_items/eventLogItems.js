;
(function(window, angular, undefined) {

    "use strict";

    function controller(
        $scope,
        $location,
        serviceControlService,
        notifyService) {

        $scope.model = [];
        $scope.loadingData = true;

        $scope.viewCategory = function (eventLogItem) {

            switch(eventLogItem.category) {
                case 'Endpoints':
                    $location.path('/configuration/endpoints');
                    break;
                case 'HeartbeatMonitoring':
                    $location.path('/endpoints');
                    break;
                case 'CustomChecks':
                    $location.path('/custom-checks');
                    break;
                case 'EndpointControl':
                    $location.path('/endpoints');
                    break;
                case 'MessageFailures':
                    $location.path('/failed-messages/groups');
                    break;
                case 'Recoverability':
                    $location.path('/failed-messages/groups');
                    break;
                case 'MessageRedirects':
                    $location.path('/configuration/redirects');
                    break;
                default:
            }
        }

        serviceControlService.getEventLogItems().then(function(eventLogItems) {
            $scope.model = eventLogItems;
            $scope.loadingData = false;
        });

        var notifier = notifyService();
        notifier.subscribe($scope, function(event, data) {
            $scope.model.push(angular.extend(data));
        }, "EventLogItemAdded");
    };

    controller.$inject = [
        "$scope",
        "$location",
        "serviceControlService",
        "notifyService"
    ];

    angular.module("eventLogItems", [])
        .controller("EventLogItemsCtrl", controller);

}(window, window.angular));