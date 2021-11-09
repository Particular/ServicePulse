(function (window, angular) {
    'use strict';

    function controller($scope, notifyService, platfromConnectionService) {
        var notifier = notifyService();
        var vm = this;
        
        vm.connectionSnippet = '';

        notifier.subscribe($scope, (event, response) => {
            vm.connectionSnippet = JSON.stringify(response.connectionSettings, null, "\t");
        }, 'PlatformConnectionSeetingsUpdated');

    }

    controller.$inject = [
        '$scope',
        'notifyService',
        'platformConnectionService'
    ];

    angular.module('configuration.platformconnection')
        .controller('platformConnectionController', controller);

})(window, window.angular);