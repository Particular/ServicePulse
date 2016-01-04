;
(function(window, angular, undefined) {
    "use strict";

    function service($http, scConfig) {

        function _getReleases() {
            return $http
                .get(scConfig.service_pulse_url, {
                     responseType: "json"
                })
                .then(function(response) {
                    return response;
                }, function(response) {
                    return {
                        // suppress error
                        data: []
                    };
                });
        };

        return {
            getReleases: _getReleases
        };
    }

    service.$inject = [
        "$http", "scConfig"
    ];


    angular.module("services.platformUpdateService", [])
        .service("platformUpdateService", service);


})(window, window.angular);