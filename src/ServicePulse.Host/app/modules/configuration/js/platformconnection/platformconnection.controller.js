(function (window, angular) {
    'use strict';

    function controller($scope, notifyService, platfromConnectionService) {
        var notifier = notifyService();
        var vm = this;
        var snippetTemplate = 
`var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(@"<json>");


endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);
`;

        vm.connectionSnippet = '';

        notifier.subscribe($scope, (event, response) => {
            var jsonText = JSON.stringify(response.connectionSettings, null, 4)
            .replaceAll('"', '""');

            vm.connectionSnippet = snippetTemplate.replace('<json>', jsonText);

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