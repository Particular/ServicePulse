(function (window, angular) {
    'use strict';

    function service(
            $http,
            $log,
            $timeout,
            $q,            
            connectionsManager,
            uri
        ) {
       
        var scu = connectionsManager.getServiceControlUrl();

        function patchPromise(url, success, error, ids) {

            var defer = $q.defer();

            success = success || 'success';
            error = error || 'error';

            $http.patch(url, ids)
                .then(function (response) {
                    defer.resolve(success + ':' + response);
                }, function (response) {
                    defer.reject(error + ':' + response);
                });

            return defer.promise;
        }

        var previousArchiveGroupEtag;

        return {
            getArchivedMessages: function (groupId, sort, page, direction, start, end) {
                var url = '';
                if (groupId) {
                    url = uri.join(scu, 'recoverability', 'groups', groupId, 'errors?page=' + page + '&sort=' + sort + '&status=archived');
                } else {
                    if (start && end) {
                        url = uri.join(scu, 'errors?status=archived&page=' + page + '&sort=' + sort + '&direction=' + direction + '&modified=' + start + '...' + end);
                    } else {
                        url = uri.join(scu, 'errors?status=archived&page=' + page + '&sort=' + sort + '&direction=' + direction);
                    }
                }

                return $http.get(url).then(function (response) {
                    return {
                        data: response.data,
                        total: response.headers('Total-Count')
                    };
                });
            },

            getArchivedCount: function () {
                var url = uri.join(scu, 'errors?status=archived');

                return $http.head(url).then(function (response) {
                   
                    return response.headers('Total-Count');
                });
            },

            restoreFromArchive: function (startdate, enddate, success, error) {
                var url = uri.join(scu, 'errors', startdate.format('YYYY-MM-DDTHH:mm:ss') + '...' + enddate.format('YYYY-MM-DDTHH:mm:ss'), 'unarchive');
                return patchPromise(url, success, error);
            },

            restoreMessageFromArchive: function (id, success, error) {
                var url = uri.join(scu, 'errors', 'unarchive');
                return patchPromise(url, success, error, [id]);
            },

            restoreMessagesFromArchive: function (ids, success, error) {
                var url = uri.join(scu, 'errors', 'unarchive');
                return patchPromise(url, success, error, ids);
            },

            getArchiveGroup: function(groupId) {
                var url = uri.join(scu, 'archive', 'groups', 'id', groupId);
                return $http.get(url).then(function (response) {
                    var status = 200;
                    if (previousArchiveGroupEtag === response.headers('etag')) {
                        status = 304;
                    } else {
                        previousArchiveGroupEtag = response.headers('etag');
                    }
                    return {
                        data: response.data,
                        status: status
                    };
                });
            }
        };
    }

    service.$inject = [
        '$http',
        '$log',
        '$timeout',
        '$q',        
        'connectionsManager',
        'uri'
    ];

    angular.module('sc')
        .service('archivedMessageService', service);

})(window, window.angular);