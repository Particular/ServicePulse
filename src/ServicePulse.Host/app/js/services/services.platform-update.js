;
(function(window, angular, undefined) {
    "use strict";

    function service($http, $q) {

        function getReleases() {


            var serviceProductUrls = [
                { product:'SP', url: '//platformupdate.particular.net/servicepulse.txt' },
                { product: 'SC', url: '//platformupdate.particular.net/servicecontrol.txt' }
            ];

            return $q.all(serviceProductUrls.map(function (item) {
                return $http({
                    method: 'GET',
                    url: item.url
                });
            }))
          .then(function (results) {
              var resultObj = {};
              results.forEach(function (val, i) {
                  resultObj[serviceProductUrls[i].product] = val.data;
              });
              return resultObj;
          });

        };

        return {
            getReleases: getReleases
        };
    }

    service.$inject = [
        "$http", "$q"
    ];


    angular.module("services.platformUpdateService", [])
        .service("platformUpdateService", service);


})(window, window.angular);