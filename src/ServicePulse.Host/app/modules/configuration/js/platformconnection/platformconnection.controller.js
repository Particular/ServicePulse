(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        connectionsManager,
        $http,
        uri) {

        var vm = this;

        var initialServiceControlUrl = connectionsManager.getServiceControlUrl();
        var initialMonitoringUrl = connectionsManager.getMonitoringUrl();
        var isMonitoringEnabled = connectionsManager.getIsMonitoringEnabled();
    }

    controller.$inject = [
        '$scope',
        'connectionsManager',
        '$http',
        'uri',
    ];

    angular.module('configuration.connections')
        .controller('platformConnectionController', controller);

})(window, window.angular);