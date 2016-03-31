
; (function (window, angular, $, undefined) {
    'use strict';


    function controller($scope, $location, sharedDataService, notifyService) {

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
            archived: stats.number_of_archived_messages
        }

        $scope.viewExceptionGroup= function() {
            sharedDataService.set(allFailedMessagesGroup);
            $location.path('/failedMessages');
        }

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


        

    }

    controller.$inject = ['$scope', '$location', 'sharedDataService', 'notifyService'];

    function directive() {
        return {
            scope: {
                version: '@',
                scversion: '@'
            },
            restrict: 'AEM',
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

