; (function (window, angular, undefined) {
    'use strict';

    function formatter() {
        var secondDuration = moment.duration(1000);
        var minuteDuration = moment.duration(60 * 1000);
        var hourDuration = moment.duration(60 * 1000); //this ensure that we never use minute formatting
        var dayDuration = moment.duration(24 * 60 * 60 * 1000);

        function formatTime(value) {
            var duration = moment.duration(value);

            var time = { value: 0, unit: '' };
            if (duration >= dayDuration) {
                time.value = duration.format('D [d] h [h]');
                return time;
            } else if (duration >= hourDuration) {
                time.value = moment(duration._data).format('HH:mm');
                time.unit = 'h';
                return time;
            } else if (duration >= minuteDuration) {
                time.value = duration.format('mm:ss');
                time.unit = 'min';
                return time;
            } else if (duration >= secondDuration) {
                time.value = duration.format('ss.S');
                time.unit = 's';
                return time;
            } else {
                time.value = duration.format('S');
                time.unit = 'ms';
                return time;
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