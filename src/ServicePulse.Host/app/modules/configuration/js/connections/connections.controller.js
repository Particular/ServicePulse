; (function (window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        connectionsService,
        notifyService) {
        var notifier = notifyService();
        var vm = this;
       
        vm.loadingData = false;
        vm.connections = [];
    }

    controller.$inject = [
        '$scope',
        'connectionsService',
        'notifyService'
    ];

    angular.module('configuration.connections')
        .controller('connectionsController', controller);

})(window, window.angular);