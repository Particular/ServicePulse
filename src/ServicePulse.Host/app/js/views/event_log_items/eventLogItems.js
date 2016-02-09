;
(function(window, angular, undefined) {

    "use strict";

    function controller(
        $scope,
        serviceControlService,
        notifyService) {
        $scope.model = [];
        $scope.loadingData = true;

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
        "serviceControlService",
        "notifyService"
    ];

    angular.module("eventLogItems", [])
        .controller("EventLogItemsCtrl", controller);

}(window, window.angular));