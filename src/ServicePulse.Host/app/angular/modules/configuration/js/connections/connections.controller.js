(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        connectionsManager,
        $http,
        notifyService,
        connectionsStatus,
        uri) {

        var vm = this;
        var notifier = notifyService();

        var initialServiceControlUrl = connectionsManager.getServiceControlUrl();
        var initialMonitoringUrl = connectionsManager.getMonitoringUrl();
        var isMonitoringEnabled = connectionsManager.getIsMonitoringEnabled();

        vm.loadingData = false;
        vm.configuredServiceControlUrl = initialServiceControlUrl;
        vm.configuredMonitoringUrl = initialMonitoringUrl;

        vm.unableToConnectToServiceControl = false;
        vm.unableToConnectToMonitoring = false;

        var evalConnectionsStatus = function () {
            if (connectionsStatus.isSCConnecting) {
                vm.unableToConnectToServiceControl = false;
            } else {
                vm.unableToConnectToServiceControl = !connectionsStatus.isSCConnected;
            }

            if (!isMonitoringEnabled || connectionsStatus.isMonitoringConnecting || connectionsStatus.isMonitoringConnecting === undefined) {
                vm.unableToConnectToMonitoring = false;
            } else {
                vm.unableToConnectToMonitoring = !connectionsStatus.isMonitoringConnected;
            }
        }

        notifier.subscribe($scope, (event, data) => {
            evalConnectionsStatus();
        }, 'ConnectionsStatusChanged');

        function prependSchemeIfMissing(userUrl) {
            var url = userUrl.toLowerCase();
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return userUrl;
            }

            return 'http://' + userUrl;
        }

        vm.testServiceControlUrl = () => {
            if (vm.configuredServiceControlUrl) {
                vm.configuredServiceControlUrl = prependSchemeIfMissing(vm.configuredServiceControlUrl);
                vm.testingServiceControl = true;
                $http.get(vm.configuredServiceControlUrl).then(() => {
                    vm.serviceControlValid = true;
                }, (error) => {
                    vm.serviceControlValid = false;
                }).then(() => {
                    vm.testingServiceControl = false;
                });
            }
        };

        vm.testMonitoringUrl = () => {
            if (vm.configuredMonitoringUrl) {
                vm.configuredMonitoringUrl = prependSchemeIfMissing(vm.configuredMonitoringUrl);
                vm.testingMonitoring = true;
                /*
                Monitoring root URL doesn't support CORS, 
                so to test connectivity we need to hit one
                of the Monitoring API URLs that are CORS enabled.
                */
                var urlToTest = uri.join(vm.configuredMonitoringUrl, '/monitored-endpoints');
                $http.get(urlToTest).then(() => {
                    vm.monitoringValid = true;
                }, (error) => {
                    vm.monitoringValid = false;
                }).then(() => {
                    vm.testingMonitoring = false;
                });
            }
        };

        vm.save = () => {
            connectionsManager.updateConnections(vm.configuredServiceControlUrl, vm.configuredMonitoringUrl);
        };

        evalConnectionsStatus();
    }

    controller.$inject = [
        '$scope',
        'connectionsManager',
        '$http',
        'notifyService',
        'connectionsStatus',
        'uri',
    ];

    angular.module('configuration.connections')
        .controller('connectionsController', controller);

})(window, window.angular);