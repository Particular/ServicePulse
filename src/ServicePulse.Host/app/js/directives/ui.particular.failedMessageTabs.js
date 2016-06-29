
; (function (window, angular, $, undefined) {
    'use strict';


    function controller($scope, $interval, $location, sharedDataService, notifyService, serviceControlService) {

        var notifier = notifyService();

        $scope.isActive = function (viewLocation) {
            var active = (viewLocation === $location.path());
            return active;
        };

        var stats = sharedDataService.getstats();
        var allFailedMessagesGroup = { 'id': undefined, 'title': 'All Failed Messages', 'count': stats.number_of_failed_messages }

        $scope.counters = {
            group: stats.number_of_exception_groups,
            message: stats.number_of_failed_messages,
            archived: stats.number_of_archived_messages,
            pendingRetries: stats.number_of_pending_retries
    }

        $scope.viewExceptionGroup = function () {
            sharedDataService.set(allFailedMessagesGroup);
            $location.path('/failedMessages');
        }

        var exceptionPromise = $interval(function () {
            serviceControlService.getTotalExceptionGroups().then(function (response) {
                notifier.notify('ExceptionGroupCountUpdated', response);
            });
        }, 5000);

        var archivePromise = $interval(function () {
            serviceControlService.getTotalArchivedMessages().then(function (response) {
                notifier.notify('ArchivedMessagesUpdated', response || 0);
            });
        }, 10000);

        var pendingRetriesPromise = $interval(function () {
            serviceControlService.getTotalPendingRetries().then(function (response) {
                notifier.notify('PendingRetriesTotalUpdated', response || 0);
            });
        }, 10000);

        // Cancel interval on page changes
        $scope.$on('$destroy', function () {
            if (angular.isDefined(exceptionPromise)) {
                $interval.cancel(exceptionPromise);
                exceptionPromise = undefined;
            }
            if (angular.isDefined(archivePromise)) {
                $interval.cancel(archivePromise);
                archivePromise = undefined;
            }
            if (angular.isDefined(pendingRetriesPromise)) {
                $interval.cancel(pendingRetriesPromise);
                pendingRetriesPromise = undefined;
            }
        });


        notifier.subscribe($scope, function (event, data) {
            $scope.counters.group = data;
        }, 'ExceptionGroupCountUpdated');

        notifier.subscribe($scope, function (event, data) {
            $scope.counters.message = data;
            allFailedMessagesGroup.count = data;
        }, 'MessageFailuresUpdated');

        notifier.subscribe($scope, function (event, data) {
            $scope.counters.archived = data;
        }, 'ArchivedMessagesUpdated');
    
        notifier.subscribe($scope, function (event, data) {
            $scope.counters.pendingRetries = data;
        }, 'PendingRetriesTotalUpdated');
    }
    
    controller.$inject = ['$scope', '$interval', '$location', 'sharedDataService', 'notifyService', 'serviceControlService'];

    function directive() {
        return {
            scope: {},
            restrict: 'E',
            replace: true,
            templateUrl: 'js/directives/ui.particular.failedMessageTabs.tpl.html',
            controller: controller,
            link: function (scope, element) { }
        };
    };

    directive.$inject = [];

    angular
        .module('ui.particular.failedMessageTabs', [])
        .directive('failedMessageTabs', directive);

}(window, window.angular, window.jQuery));

