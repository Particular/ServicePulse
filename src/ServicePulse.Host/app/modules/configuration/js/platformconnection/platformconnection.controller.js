(function (window, angular) {
    'use strict';

    function controller($scope, notifyService, platfromConnectionService) {
        var notifier = notifyService();
        var vm = this;
        var snippetTemplate = 
`var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(@"<json>");

endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);
`;

        var mainInstanceSettings = {};
        var monitoringInstanceSettings = {};
        
        var mainInstanceQueryErrors = [];
        var monitoringInstanceQueryErrors = [];

        vm.connectionSnippet = '';
        vm.queryErrors = [];

        var updateConnectionSnippet = function()
        {
            var configuration = mainInstanceSettings || {};
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

            vm.queryErrors = [];
            vm.queryErrors = vm.queryErrors.concat(mainInstanceQueryErrors || []);
            vm.queryErrors = vm.queryErrors.concat(monitoringInstanceQueryErrors || []);
        };

        notifier.subscribe($scope, (event, connectionSettings) => {
            mainInstanceSettings = connectionSettings.settings;
            mainInstanceQueryErrors = connectionSettings.errors;

            updateConnectionSnippet();
        }, 'MainInstanceConnectionSeetingsUpdated');

        notifier.subscribe($scope, (event, connectionSettings) => {
            monitoringInstanceSettings = connectionSettings;
            updateConnectionSnippet();
        }, 'MonitoringInstanceConnectionSeetingsUpdated');

        platfromConnectionService.refreshConnectionSettings();
    }

    controller.$inject = [
        '$scope',
        'notifyService',
        'platformConnectionService'
    ];

    angular.module('configuration.platformconnection')
        .controller('platformConnectionController', controller);

})(window, window.angular);