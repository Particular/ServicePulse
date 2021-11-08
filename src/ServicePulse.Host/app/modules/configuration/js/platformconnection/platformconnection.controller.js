(function (window, angular) {
    'use strict';

    function controller($scope, notifyService, platfromConnectionService) {
        var notifier = notifyService();
        var vm = this;
        
        vm.connectionSettings = "some text to be added ble ble ble";

        notifier.subscribe($scope, (event, response) => {
            vm.connectionSettings = response.connectionSettings;
        }, 'PlatformConnectionSeetingsUpdated');

    }

    controller.$inject = [
        '$scope',
        'notifyService',
        'platformConnectionService',
    ];

    angular.module('configuration.platformconnection')
        .controller('platformConnectionController', controller);

})(window, window.angular);