(function(window, angular, $) {
    'use strict';

    function Service($http, uri, Rx, connectionsManager) {

        var scu = connectionsManager.getServiceControlUrl();
        
        function getEventLogItems(pageNo, pageSize) {
            return $http.get(uri.join(scu, 'eventlogitems') + '?page=' + pageNo + '&per_page=' + pageSize)
                .then(function (result) {                    
                    return {data: result.data, total: result.headers('total-count')};
                }, function (error) {
                    return { error: error };
                });
        }        

        function createAuditLogSource(pageNo, pageSize) {
            return Rx.Observable.interval(5000).startWith(0)
                .flatMap(function (i) {
                    return Rx.Observable.fromPromise(getEventLogItems(pageNo, pageSize));
                });
        }       
        
        var service = {
            createAuditLogSource: createAuditLogSource
        };

        return service;
    }

    Service.$inject = ['$http', 'uri', 'rx', 'connectionsManager'];

    angular.module('events.module')
        .service('auditLogService', Service);
}(window, window.angular, window.jQuery));
