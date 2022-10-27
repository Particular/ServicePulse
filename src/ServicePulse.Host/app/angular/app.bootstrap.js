(function (window, angular, $) {
    'use strict';

    var serviceControlApp = angular.module('sc');

    var injector = angular.injector(['ng']);
    var $http = injector.get('$http');

    var scUrl = window.connectionsManager.getServiceControlUrl();
    console.debug('Retrieving license from ServiceControl at: ', scUrl);

    $http.get(scUrl + '/license').then(function (response) {

        serviceControlApp.constant('license', response.data);

    }, function () {

        serviceControlApp.constant('license', { 'license_status': 'Unavailable' });

    }).then(function () {

        angular.element(document).ready(function () {
            angular.bootstrap(document, ['sc']);
        });

    });
}(window, window.angular, window.jQuery));
