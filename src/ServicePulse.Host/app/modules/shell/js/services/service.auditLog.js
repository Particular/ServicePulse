(function(window, angular, $) {
    'use strict';

    function Service($http, uri, Rx) {

        //var scu = connectionsManager.getServiceControlUrl();
        
        var scu = 'http://localhost:33333/api';
        
        function getEventLogItems(pageNo) {
            return $http.get(uri.join(mu, 'eventlogitems') + "?page=" + pageNo)
                .then(function (result) {                    
                    return {data: result.data, total: result.TotalResults};
                }, function (error) {
                    return { error: error };
                });
        }        

        function createAuditLogSource(pageNo) {
            return Rx.Observable.interval(refreshInterval).startWith(0)
                .flatMap(function (i) {
                    return Rx.Observable.fromPromise(getEventLogItems(pageNo));
                });
        }

        var service = {
            createAuditLogSource: createAuditLogSource
        };

        return service;
    }

    Service.$inject = ['$http', 'uri', 'rx'];

    angular.module('events.module')
        .service('auditLogService', Service);
}(window, window.angular, window.jQuery));
