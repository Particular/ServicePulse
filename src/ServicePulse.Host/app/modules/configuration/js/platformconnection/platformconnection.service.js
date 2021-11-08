(function (window, angular) {
    'use strict';

    function service($http, uri, connectionsManager, notifyService) {
        var notifier = notifyService();
        var scu = connectionsManager.getServiceControlUrl();

        function refreshPlatformConnectionSettings() {
            var url = uri.join(scu, 'connection');
            return $http.get(url).then(function (response) {
                var connectionSettings = response.data;

                notifier.notify('PlatformConnectionSeetingsUpdated', { connectionSettings });
            });
        }

        refreshPlatformConnectionSettings();

        return {
            refreshPlatformConnectionSettings
        };
    }

    service.$inject = ['$http', 'uri', 'connectionsManager', 'notifyService'];

    angular.module('configuration.platformconnection')
        .service('platformConnectionService', service);

})(window, window.angular);