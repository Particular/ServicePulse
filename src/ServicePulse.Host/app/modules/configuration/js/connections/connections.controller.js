; (function (window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        notifyService,
        connectionsManager) {
        var notifier = notifyService();
        var vm = this;
       
        vm.loadingData = false;
        vm.configuredServiceControlUrl = connectionsManager.getServiceControlUrl();
        vm.configuredMonitoringUrl = connectionsManager.getMonitoringUrl();
    }

    controller.$inject = [
        '$scope',
        'notifyService',
        'connectionsManager'
    ];

    angular.module('configuration.connections')
        .controller('connectionsController', controller);

})(window, window.angular);