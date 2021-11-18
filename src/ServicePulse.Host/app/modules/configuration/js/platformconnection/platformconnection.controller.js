(function (window, angular) {
    'use strict';

    function controller($scope, notifyService, platfromConnectionService) {
        var notifier = notifyService();
        var vm = this;
        var snippetTemplate = 
`var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(@"<json>");


endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);
`;

        var mainInstanceSettings = null;
        var monitoringInstanceSettings = null;

        vm.connectionSnippet = '';

        var updateConnectionSnippet = function()
        {
            var configuration = mainInstanceSettings;
            for(var property in monitoringInstanceSettings)
            {
                if(monitoringInstanceSettings.hasOwnProperty(property))
                {
                    configuration[property] = monitoringInstanceSettings[property];
                }
            }

            var jsonText = JSON
                .stringify(configuration, null, 4)
                .replaceAll('"', '""');

            vm.connectionSnippet = snippetTemplate.replace('<json>', jsonText);
        };

        notifier.subscribe($scope, (event, response) => {
            mainInstanceSettings = response.connectionSettings;
            updateConnectionSnippet();
        }, 'MainInstanceConnectionSeetingsUpdated');

        notifier.subscribe($scope, (event, response) => {
            monitoringInstanceSettings = response.connectionSettings;
            updateConnectionSnippet();
        }, 'MonitoringInstanceConnectionSeetingsUpdated');
    }

    controller.$inject = [
        '$scope',
        'notifyService',
        'platformConnectionService'
    ];

    angular.module('configuration.platformconnection')
        .controller('platformConnectionController', controller);

})(window, window.angular);