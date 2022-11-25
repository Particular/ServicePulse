(function(window, angular, $) {
    'use strict';

    function controller($scope, $rootScope, $interval, $location, sharedDataService, notifyService, serviceControlService, showPendingRetry) {

        var notifier = notifyService();

        $scope.isActive = function(viewLocation) {
            return (viewLocation === $location.path());
        };

        $scope.supportsArchiveGroups = $rootScope.supportsArchiveGroups;

        var stats = sharedDataService.getstats();
        var allFailedMessagesGroup = { 'id': undefined, 'title': 'All Failed Messages', 'count': stats.number_of_failed_messages }
        $scope.showPendingRetry = showPendingRetry;
        $scope.counters = {
            message: stats.number_of_failed_messages,
            archived: stats.number_of_archived_messages,
            pendingRetries: stats.number_of_pending_retries
        };

        $scope.viewExceptionGroup = function() {
            sharedDataService.set(allFailedMessagesGroup);
            $location.url('/failed-messages/all');
        }

        var archiveMessagesUpdatedTimer = $interval(function() {
            serviceControlService.getTotalArchivedMessages().then(function(response) {
                notifier.notify('ArchivedMessagesUpdated', response || 0);
            });
        }, 10000);

        var pendingRetriesUpdatedTimer = $interval(function() {
            serviceControlService.getTotalPendingRetries().then(function(response) {
                notifier.notify('PendingRetriesTotalUpdated', response || 0);
            });
        }, 10000);

        var messageFailuresUpdatedTimer = $interval(function () {
            serviceControlService.getTotalFailedMessages().then(function (response) {
                notifier.notify('MessageFailuresUpdated', response || 0);
            });
        }, 10000);

        // Cancel interval on page changes
        $scope.$on('$destroy', function() {
            if (angular.isDefined(archiveMessagesUpdatedTimer)) {
                $interval.cancel(archiveMessagesUpdatedTimer);
                archiveMessagesUpdatedTimer = undefined;
            }
            if (angular.isDefined(pendingRetriesUpdatedTimer)) {
                $interval.cancel(pendingRetriesUpdatedTimer);
                pendingRetriesUpdatedTimer = undefined;
            }
            if (angular.isDefined(messageFailuresUpdatedTimer)) {
                $interval.cancel(messageFailuresUpdatedTimer);
                messageFailuresUpdatedTimer = undefined;
            }
        });

        notifier.subscribe($scope, function(event, data) {
            $scope.counters.message = data;
            allFailedMessagesGroup.count = data;
        }, 'MessageFailuresUpdated');

        notifier.subscribe($scope, function(event, data) {
            $scope.counters.archived = data;
        }, 'ArchivedMessagesUpdated');

        notifier.subscribe($scope, function(event, data) {
            $scope.counters.pendingRetries = data;
        }, 'PendingRetriesTotalUpdated');
    }

    controller.$inject = ['$scope', '$rootScope', '$interval', '$location', 'sharedDataService', 'notifyService', 'serviceControlService', 'showPendingRetry'];

    function directive() {
        return {
            scope: {},
            restrict: 'E',
            replace: true,
            templateUrl: 'js/directives/ui.particular.failedMessageTabs.tpl.html',
            controller: controller,
            link: function(scope, element) {}
        };
    }

    directive.$inject = [];

    angular
        .module('ui.particular.failedMessageTabs', [])
        .directive('failedMessageTabs', directive);

}(window, window.angular, window.jQuery));

