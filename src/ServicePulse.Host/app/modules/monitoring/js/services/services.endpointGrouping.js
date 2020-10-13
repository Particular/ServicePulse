(function (angular) {
    "use strict";

    angular.module("services.endpointGrouping", ["sc"])
        .factory("endpointGrouping", function() {
            return {
                group: function(endpoints) {
                    return endpoints;
                }
            }
        });


})(window.angular);