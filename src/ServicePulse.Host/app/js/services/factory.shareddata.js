;
(function(window, angular, undefined) {
    "use strict";

    function factory($localStorage) {

        var storage = $localStorage.$default({});

        function set(data) {
            storage.data = data;
        }

        function get() {
            return storage.data;
        }

        return {
            set: set,
            get: get
        };

    }

    factory.$inject = [
  
        "$localStorage"
    ];

    angular.module("sc")
        .service("sharedDataService", factory);

}(window, window.angular));