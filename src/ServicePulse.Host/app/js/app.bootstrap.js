; (function (window, angular, $, undefined) {
    'use strict';

    var serviceControlApp = angular.module('sc');

    var injector = angular.injector(['ng']);
    var $http = injector.get('$http');
    var scConfig = window.config;

    $http.get(scConfig.service_control_url + '/license').then(function (response) {
        serviceControlApp.constant('license', response.data);

        angular.element(document).ready(function () {
            angular.bootstrap(document, ['sc']);
        });
    }, function () {
        window.document.getElementById('cantConnectMessage').style.display = 'block';
        window.document.getElementById('connectingToServiceControl').style.display = 'none';
        window.document.getElementById('serviceControlUrl').innerHTML = ' hosted at <a href="' + scConfig.service_control_url + '">' + scConfig.service_control_url + '</a>';
    });
}(window, window.angular, window.jQuery));