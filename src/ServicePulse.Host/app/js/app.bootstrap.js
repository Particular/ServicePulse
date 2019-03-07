; (function (window, angular, $, undefined) {
    'use strict';

    var serviceControlApp = angular.module('sc');

    var injector = angular.injector(['ng']);
    var $http = injector.get('$http');
    var scConfig = window.config;

    $http.get(scConfig.service_control_url + '/license').then(function (response) {

        serviceControlApp.constant('license', response.data);

    }, function () {

        serviceControlApp.constant('license', { 'license_status': 'Unavailable' });

    }).then(function () {

        angular.element(document).ready(function () {
            angular.bootstrap(document, ['sc']);
        });

    });
}(window, window.angular, window.jQuery));