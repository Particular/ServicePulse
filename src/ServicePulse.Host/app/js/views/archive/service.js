; (function (window, angular, undefined) {
    'use strict';

    function service(
            $http,
            $log,
            $timeout,
            $q,
            notifyService,
            scConfig,
            uri
        ) {

        var notifier = notifyService();

        function patchPromise(url, success, error, ids) {

            var defer = $q.defer();

            success = success || 'success';
            error = error || 'error';

            $http.patch(url, ids)
                .success(function (response) {
                    defer.resolve(success + ':' + response);
                })
                .error(function (response) {
                    defer.reject(error + ':' + response);
                });

            return defer.promise;
        }

        return {

            getArchivedMessages: function (sort, page, direction, start, end) {

                var url = uri.join(scConfig.service_control_url, 'errors?status=archived&page=' + page + '&sort=' + sort + '&direction=' + direction); // + '&modified=' = 2016-01-25T15:38:35.6767764Z...2016-11-25T15:38:36.6767764Z');

                return $http.get(url).then(function (response) {
                    notifier.notify('ArchivedMessagesUpdated', response.headers('Total-Count'));

                    return {
                        data: response.data,
                        total: response.headers('Total-Count')
                    };
                });

            },

            getArchivedCount: function () {

                var url = uri.join(scConfig.service_control_url, 'errors?status=archived');

                return $http.head(url).then(function (response) {
                    notifier.notify('ArchivedMessagesUpdated', response.headers('Total-Count'));
                    return response.headers('Total-Count');
                });
            },

            restoreFromArchive: function (startdate, enddate, success, error) {

                var url = uri.join(scConfig.service_control_url, 'errors', startdate.format('YYYY-MM-DDTHH:mm:ss') + '...' + enddate.format('YYYY-MM-DDTHH:mm:ss'), 'unarchive');
                return patchPromise(url, success, error);
            },

            restoreMessageFromArchive: function (id, success, error) {

                var url = uri.join(scConfig.service_control_url, 'errors', 'unarchive');
                return patchPromise(url, success, error, [id]);
            },

            restoreMessagesFromArchive: function (ids, success, error) {

                var url = uri.join(scConfig.service_control_url, 'errors', 'unarchive');
                return patchPromise(url, success, error, ids);
            }
        };
    }

    service.$inject = [
        '$http',
        '$log',
        '$timeout',
        '$q',
        'notifyService',
        'scConfig',
        'uri'
    ];

    angular.module('sc')
        .service('archivedMessageService', service);

})(window, window.angular);