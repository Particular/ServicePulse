﻿(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        alertingService,
        $http,
        notifyService,
        toastService,
        uri) {

        var vm = this;
        var notifier = notifyService();

        notifier.subscribe($scope, (event, response) => {
            vm.settings = response.alerting;
        }, 'AlertingConfigurationUpdated');

        function refreshData() {
            alertingService.getSettings().then((alerting) => {
                vm.settings = alerting;
            });
        }

        vm.settings = {};

        vm.toogleAlerting = () => {
            var emailAlertingOn = !vm.settings.alerting_enabled;

            alertingService.toogleEmailNotifications(vm.settings.alerting_enabled).then(
                () => {
                    toastService.showInfo('Email notifications are now turned ' + (emailAlertingOn ? 'on.' : 'off.')),
                    vm.settings.alerting_enabled = emailAlertingOn;
                },
                () => toastService.showError('Failed to update settings.')
            );
        };

        vm.save = (alertingForm) => {
            if (alertingForm.$valid) {
                alertingService.updateSettings(vm.settings).then(
                    () => toastService.showInfo('Alerting settings updated.'),
                    () => toastService.showError('Failed not update settings.'));
            }
        };

        vm.sendTestEmail = () => {
            alertingService.sendTestEmail().then(
                () => toastService.showInfo('Test email sent. Check you inbox.'),
                () => toastService.showError('Could not send test email. Please make sure the configuration is correct.')
            );
        };

        refreshData();
    }

    controller.$inject = [
        '$scope',
        'alertingService',
        '$http',
        'notifyService',
        'toastService',
        'connectionsStatus',
        'uri',
    ];

    angular.module('configuration.alerting')
        .controller('alertingController', controller);

})(window, window.angular);