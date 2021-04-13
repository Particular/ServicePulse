(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        alertingService,
        $http,
        notifyService,
        uri) {

        var vm = this;
        var notifier = notifyService();

        vm.smtpServerAddress = "";
        vm.smtpServerPort = "";
        vm.account = "";
        vm.password = "";
        vm.enableSSL = false;
        vm.alertingEnabled = true;

        vm.sendTestEmail = () => {
            alert('send test email');
        };

        vm.toogleAlerting = () => {
            alert('toogle');
        };

        vm.save = () => {
            alert('save');
        };
    }

    controller.$inject = [
        '$scope',
        'connectionsManager',
        '$http',
        'notifyService',
        'connectionsStatus',
        'uri',
    ];

    angular.module('configuration.alerting')
        .controller('alertingController', controller);

})(window, window.angular);