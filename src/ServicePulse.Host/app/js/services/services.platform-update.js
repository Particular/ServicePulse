'use strict';

angular.module('services.platformUpdateService', [])
    .service('platformUpdateService', [
        '$http', 'scConfig', function ($http, scConfig) {

            this.getReleases = function () {
                return $http
                    .get(scConfig.service_pulse_url, { responseType: 'json' })
                    .then(function (response) {
                        return response;
                    });
            };
        }
    ]);