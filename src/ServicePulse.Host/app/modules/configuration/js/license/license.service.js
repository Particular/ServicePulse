﻿;
(function (window, angular, undefined) {
    'use strict';

    function service($http, $q, scConfig, uri, notifyService) {
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
            var url = uri.join(scConfig.service_control_url, 'license');

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

    service.$inject = ['$http', '$q', 'scConfig', 'uri', 'notifyService'];

    angular.module('configuration.license')
        .service('licenseService', service);

}(window, window.angular));