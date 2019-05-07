; (function (window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        connectionsManager,
        $http,
        notifyService,
        connectionsStatus) {

        var vm = this;
        var notifier = notifyService();

        var initialServiceControlUrl = connectionsManager.getServiceControlUrl();
        var initialMonitoringUrl = connectionsManager.getMonitoringUrl();
        var isMonitoringEnabled = connectionsManager.getIsMonitoringEnabled();

        vm.loadingData = false;
        vm.configuredServiceControlUrl = initialServiceControlUrl;
        vm.configuredMonitoringUrl = initialMonitoringUrl;

        vm.unableToConnectToServiceControl = undefined;
        vm.unableToConnectToMonitoring = undefined;
        var evalConnectionsStatus = function(){
            if(connectionsStatus.isSCConnecting){
                vm.unableToConnectToServiceControl = false;
            }else{
                vm.unableToConnectToServiceControl = !connectionsStatus.isSCConnected;
            }
            vm.unableToConnectToMonitoring = isMonitoringEnabled && !connectionsStatus.isMonitoringConnected;
        }

        notifier.subscribe($scope, (event, data) => {
            evalConnectionsStatus();
        }, 'ConnectionsStatusChanged');

        evalConnectionsStatus();

        vm.testServiceControlUrl = () => {
            if (vm.configuredServiceControlUrl) {
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
                vm.testingMonitoring = true;
                $http.get(vm.configuredMonitoringUrl).then(() => {
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
    }

    controller.$inject = [
        '$scope',
        'connectionsManager',
        '$http',
        'notifyService',
        'connectionsStatus',
    ];

    angular.module('configuration.connections')
        .controller('connectionsController', controller);

})(window, window.angular);