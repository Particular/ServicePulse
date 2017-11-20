; (function (window, angular, undefined) {
    'use strict';

    function formatter() {
    //for Option 6
        var secondDurationOption6 = moment.duration(1000);
        var minuteDurationOption6 = moment.duration(60 * 1000);
        var hourDurationOption6 = moment.duration(60 * 60 * 1000);
        var dayDurationOption6 = moment.duration(24 * 60 * 60 * 1000);

        //for Option 8
        var secondDurationOption8 = moment.duration(10 * 1000);
        var minuteDurationOption8 = moment.duration(60 * 1000);
        var hourDurationOption8 = moment.duration(60 * 1000);
        var dayDurationOption8 = moment.duration(24 * 60 * 60 * 1000);

        //for Option 9
        var secondDurationOption9 = moment.duration(0);
        var minuteDurationOption9 = moment.duration(60 * 1000);
        var hourDurationOption9 = moment.duration(60 * 1000);
        var dayDurationOption9 = moment.duration(24 * 60 * 60 * 1000);

        var secondDuration = moment.duration(1000);
        var minuteDuration = moment.duration(60 * 1000);
        var hourDuration = moment.duration(60 * 1000);
        var dayDuration = moment.duration(24 * 60 * 60 * 1000);

        function applyDurationsBasedOnOption(option) {
            if (option === "6") {
                secondDuration = secondDurationOption6;
                minuteDuration = minuteDurationOption6;
                hourDuration = hourDurationOption6;
                dayDuration = dayDurationOption6;
            } else if (option === "8") {
                secondDuration = secondDurationOption8;
                minuteDuration = minuteDurationOption8;
                hourDuration = hourDurationOption8;
                dayDuration = dayDurationOption8;
            } else if (option === "9") {
                secondDuration = secondDurationOption9;
                minuteDuration = minuteDurationOption9;
                hourDuration = hourDurationOption9;
                dayDuration = dayDurationOption9;
            }
        }

        function formatTime(value, timeFormatOption) {
            var duration = moment.duration(value);
            applyDurationsBasedOnOption(timeFormatOption);

            if (duration >= dayDuration) {
                return duration.format('D [d] h [h]');
            } else if (duration >= hourDuration) {
                return moment(duration._data).format('HH:mm [h]');
            } else if (duration >= minuteDuration) {
                return duration.format('mm:ss [min]');
            } else if (duration >= secondDuration) {
                //return duration.format('ss.S [s]');
                return duration.asSeconds().toFixed(1) + ' s';
            } else {
                return duration.format('S [ms]');
            }
        }

        function formatLargeNumber(value, decimals) {
            var exp,
                suffixes = ['k', 'M', 'G', 'T', 'P', 'E'];

            value = Number(value);

            if (window.isNaN(value)) {
                return null;
            }

            if (value < 1000) {
                return value.toFixed(decimals);
            }

            exp = Math.floor(Math.log(value) / Math.log(1000));

            return (value / Math.pow(1000, exp)).toFixed(decimals) + suffixes[exp - 1];
        }

        return {
            formatTime: formatTime,
            formatLargeNumber: formatLargeNumber
        };
    }

    formatter.$inject = [];

    angular.module('sc')
        .service('formatter', formatter);
}(window, window.angular));