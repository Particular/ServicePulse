(function (window, angular) {
    'use strict';

    function controller($scope, $http, uri, connectionsManager) {
        var mainInstanceUrl = uri.join(connectionsManager.getServiceControlUrl(), 'connection');
        var monitoringInstanceUrl = uri.join(connectionsManager.getMonitoringUrl(), 'connection');

        var vm = this;
        var snippetTemplate = 
`var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(@"<json>");

endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);
`;
        vm.jsonSnippet = 
`var json = File.ReadAllText("<path-to-json-file>.json");
var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(json);
endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);
`;

        var mainInstanceSettings = {};
        var monitoringInstanceSettings = {};
        
        var mainInstanceQueryErrors = [];
        var monitoringInstanceQueryErrors = [];

        vm.inlineSnippet = '';
        vm.json = '';
        vm.queryErrors = [];

        var updateConnectionSnippet = () =>
        {
            var configuration = mainInstanceSettings || {};
            for(var property in monitoringInstanceSettings)
            {
                if(Object.prototype.hasOwnProperty.call(monitoringInstanceSettings, property))
                {
                    configuration[property] = monitoringInstanceSettings[property];
                }
            }

            var jsonText = JSON.stringify(configuration, null, 4);
            vm.json = jsonText;

            jsonText = jsonText.replaceAll('"', '""');
            vm.inlineSnippet = snippetTemplate.replace('<json>', jsonText);

            vm.queryErrors = [];
            vm.queryErrors = vm.queryErrors.concat(mainInstanceQueryErrors || []);
            vm.queryErrors = vm.queryErrors.concat(monitoringInstanceQueryErrors || []);
        };

        var refreshConnectionSettings = () => {
            $http.get(mainInstanceUrl).then(
                (response) => {
                    mainInstanceSettings = response.data.settings;
                    mainInstanceQueryErrors = response.data.errors;
                }, 
                () => {
                    mainInstanceSettings = {};
                    mainInstanceQueryErrors = ["Error reaching ServiceControl at " + mainInstanceUrl];
                }).then(() => updateConnectionSnippet());

            $http.get(monitoringInstanceUrl).then(
                (response) => {
                    monitoringInstanceSettings = response.data;
                }, 
                () => {
                    monitoringInstanceSettings = {};
                    monitoringInstanceQueryErrors = ["Error reaching SC Monitoring instance at " + monitoringInstanceUrl];
                }).then(() => updateConnectionSnippet());
        }

        refreshConnectionSettings();
    }

    controller.$inject = [
        '$scope',
        '$http',
        'uri',
        'connectionsManager'
    ];

    angular.module('configuration.platformconnection')
        .controller('platformConnectionController', controller);

})(window, window.angular);
