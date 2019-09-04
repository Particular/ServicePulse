(function (window, angular) {
    'use strict';



    function service($http, moment, connectionsManager, notifications, uri) {

        var scu = connectionsManager.getServiceControlUrl();

        function getPendingRetryMessages(searchPhrase, sortBy, page, direction, start, end) {
            var url = uri.join(scu, 'errors?status=retryissued&page=' + page + '&sort=' + sortBy + '&direction=' + direction);

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
            var url = uri.join(scu, 'errors?status=retryissued');

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

        function retryAllMessages(searchPhrase, start, end) {
            if (!start || !end) {
                start = moment(0).utc().format('YYYY-MM-DDTHH:mm:ss');
                end = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
            }

            var url = null;
            var data = {};
            if (searchPhrase) {
                url = uri.join(scu, 'pendingretries', 'queues', 'retry');
                data.queueaddress = searchPhrase;
            } else {
                url = uri.join(scu, 'pendingretries', 'retry');
            }
            data.from = start;
            data.to = end;

            return $http({
                    url: url,
                    method: 'POST',
                    data: data,
                }).then(function() {
                    notifications.pushForCurrentRoute('Retrying all pending retried messages...', 'info');
                }, function() {
                    notifications.pushForCurrentRoute('Retrying all pending messages failed', 'danger');
                });
        }

        function retryPendingRetriedMessages(selectedMessages) {
            var url = uri.join(scu, 'pendingretries', 'retry');
            return $http.post(url, selectedMessages)
                .then(function () {
                    notifications.pushForCurrentRoute('Retrying {{num}} pending retried messages...', 'info', { num: selectedMessages.length });
                }, function () {
                    notifications.pushForCurrentRoute('Retrying messages failed', 'danger');
                });
        }

        function markAsResolvedAllMessages(searchPhrase, start, end) {
            if (!start || !end) {
                start = moment(0).utc().format('YYYY-MM-DDTHH:mm:ss');
                end = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
            }
            var data = {};
            var url = null;
            if (searchPhrase) {
                url = uri.join(scu, 'pendingretries', 'queues', 'resolve');
                data.queueaddress = searchPhrase;
            } else {
                url = uri.join(scu, 'pendingretries', 'resolve');
            }
            data.from = start;
            data.to = end;

            return $http({
                    url: url,
                    method: 'PATCH',
                data: data
                }).then(function() {
                    notifications.pushForCurrentRoute('Resolving all pending retried messages...', 'info');
                }, function() {
                    notifications.pushForCurrentRoute('Resolving all pending messages failed', 'danger');
                });
        }

        function markAsResolvedMessages(selectedMessages) {
            var url = uri.join(scu, 'pendingretries', 'resolve');

            return $http({
                    url: url,
                    data: { uniquemessageids: selectedMessages },
                    method: 'PATCH'
                })
                .then(function() {
                    notifications.pushForCurrentRoute('Resolving {{num}} messages...', 'info', { num: selectedMessages.length });
                }, function() {
                    notifications.pushForCurrentRoute('Resolving messages failed', 'danger');
                });
        }

        return {
            getTotalPendingRetryMessages: getTotalPendingRetryMessages,
            getPendingRetryMessages: getPendingRetryMessages,
            markAsResolvedMessages: markAsResolvedMessages,
            markAsResolvedAllMessages: markAsResolvedAllMessages,
            retryPendingRetriedMessages: retryPendingRetriedMessages,
            retryAllMessages: retryAllMessages
        };
    }

    service.$inject = ['$http', 'moment', 'connectionsManager', 'notifications', 'uri'];

    angular.module('sc')
        .service('pendingRetryService', service);

})(window, window.angular);