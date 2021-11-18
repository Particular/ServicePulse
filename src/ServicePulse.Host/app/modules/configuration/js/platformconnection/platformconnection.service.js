(function (window, angular) {
    'use strict';

    function service($http, uri, connectionsManager, notifyService) {
        var notifier = notifyService();
        var mainInstanceUrl = connectionsManager.getServiceControlUrl();
        var monitoringInstanceUrl = connectionsManager.getMonitoringUrl();

        function refreshMainInstanceConnectionSettings() {
            var url = uri.join(mainInstanceUrl, 'connection');
            return $http.get(url).then(function (response) {
                var connectionSettings = response.data;

                notifier.notify('MainInstanceConnectionSeetingsUpdated', { connectionSettings });
            });
        }

        function refreshMonitoringInstanceConnectionSettings() {
            var url = uri.join(monitoringInstanceUrl, 'connection');
            return $http.get(url).then(function (response) {
                var connectionSettings = response.data;

                notifier.notify('MonitoringInstanceConnectionSeetingsUpdated', { connectionSettings });
            });
        }

        refreshMainInstanceConnectionSettings();
        refreshMonitoringInstanceConnectionSettings();

        return {
            refreshMainInstanceConnectionSettings,
            refreshMonitoringInstanceConnectionSettings
        };
    }

    service.$inject = ['$http', 'uri', 'connectionsManager', 'notifyService'];

    angular.module('configuration.platformconnection')
        .service('platformConnectionService', service);

})(window, window.angular);