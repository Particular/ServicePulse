(function (window, angular) {
    'use strict';

    function service($http, $q, connectionsManager, uri, notifyService) {
        var notifier = notifyService();

        var license = {
            edition: "",
            expiration_date: undefined,
            upgrade_protection_expiration: undefined,
            license_type: "",
            instance_name: "",
            trial_license: true
        };

        function getData() {
            var url = uri.join(connectionsManager.getServiceControlUrl(), 'license');

            return $http.get(url).then(function (response) {
                license = response.data;

                notifier.notify('LicenseUpdated', { license: response.data });

                return license;
            });
        }

        return {
            getLicense: function () {
                return getData();
            }
        };
    }

    service.$inject = ['$http', '$q', 'connectionsManager', 'uri', 'notifyService'];

    angular.module('configuration.license')
        .service('licenseService', service);

}(window, window.angular));