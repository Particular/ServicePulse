; (function (window, angular, undefined) {
    'use strict';

    function service($cookies) {

        var periods = [
                { value: 1,  text: "1m",  refreshInterval:  1 * 1000 },
                { value: 5,  text: "5m",  refreshInterval:  5 * 1000 },
                { value: 10, text: "10m", refreshInterval: 10 * 1000 },
                { value: 15, text: "15m", refreshInterval: 15 * 1000 },
                { value: 30, text: "30m", refreshInterval: 30 * 1000 },
                { value: 60, text: "1h",  refreshInterval: 60 * 1000 }
        ];

        this.saveSelectedPeriod = function(period) {
            $cookies.put('history_period', period.value);
        };

        this.getDefaultPeriod = function () {
            var storedPeriodValue = $cookies.get('history_period');
            var storedPeriod = periods[periods.findIndex(function(period) {
                return period.value == storedPeriodValue;
            })];

            if (typeof storedPeriodValue !== "undefined" &&
                typeof storedPeriod !== "undefined") {
                return storedPeriod;
            }

            return periods[0];
        };

        this.getAllPeriods = function() {
            return periods;
        };
    }

    service.$inject = ['$cookies'];

    angular.module('sc')
        .service('historyPeriodsService', service);
} (window, window.angular));