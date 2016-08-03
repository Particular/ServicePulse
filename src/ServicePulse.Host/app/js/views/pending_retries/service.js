; (function (window, angular, undefined) {
    'use strict';



    function service($http, scConfig, notifications, uri) {

        function getPendingRetryMessages(searchPhrase, sortBy, page, direction, start, end) {
            var url = uri.join(scConfig.service_control_url, 'errors?status=retryissued&page=' + page + '&sort=' + sortBy + '&direction=' + direction);

            if (start && end) {
                url = url + '&modified=' + start + '...' + end;
            }

            if (searchPhrase.length > 0) {
                url = url + '&queueaddress=' + searchPhrase;
            }

            return $http.get(url).then(function (response) {
                return {
                    data: response.data,
                    total: response.headers('Total-Count')
                };
            });
        }

        function getTotalPendingRetryMessages(searchPhrase, start, end) {
            var url = uri.join(scConfig.service_control_url, 'errors?status=retryissued');

            if (start && end) {
                url = url + '&modified=' + start + '...' + end;
            }

            if (searchPhrase.length > 0) {
                url = url + '&queueaddress=' + searchPhrase;
            }

            return $http.head(url).then(function (response) {
                return {
                    total: response.headers('Total-Count')
                };
            });
        }

        function retryPendingRetriedMessages(selectedMessages) {
            var url = uri.join(scConfig.service_control_url, 'pendingretries', 'retry');
            $http.post(url, selectedMessages)
                .success(function () {
                    notifications.pushForCurrentRoute('Retrying {{num}} pending retried messages...', 'info', { num: selectedMessages.length });
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Retrying messages failed', 'danger');
                });
        }

        function markAsResolvedMessages(selectedMessages) {
            var url = uri.join(scConfig.service_control_url, 'errors', 'resolve');

            $http({
                url: url,
                data: selectedMessages,
                method: 'PATCH'
            })
                .success(function () {
                    notifications.pushForCurrentRoute('Resolving {{num}} messages...', 'info', { num: selectedMessages.length });
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Resolving messages failed', 'danger');
                });
        }

        return {
            getTotalPendingRetryMessages: getTotalPendingRetryMessages,
            getPendingRetryMessages: getPendingRetryMessages,
            markAsResolvedMessages: markAsResolvedMessages,
            retryPendingRetriedMessages: retryPendingRetriedMessages
        };
    }

    service.$inject = ['$http', 'scConfig', 'notifications', 'uri'];

    angular.module('sc')
        .service('pendingRetryService', service);

})(window, window.angular);