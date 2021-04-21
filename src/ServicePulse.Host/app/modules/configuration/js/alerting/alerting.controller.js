(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        alertingService,
        notifyService,
        toastService,
        $uibModal) {

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

        vm.editEmailNotifications = () => {
            const template = require('../../views/alertingemailmodal.html');

            $uibModal.open({
                template: template,
                controller: 'editEmailController',
                resolve: {
                    data: () => {
                        return {};
                    }
                }
            });
        };

        vm.testEmailNotifications = () => {
            alertingService.testEmailNotifications().then(
                () => toastService.showInfo('Test email sent. Check you inbox.'),
                (error) => toastService.showError(error.data)
            );
        };

        refreshData();
    }

    controller.$inject = [
        '$scope',
        'alertingService',
        'notifyService',
        'toastService',
        '$uibModal'
    ];

    angular.module('configuration.alerting')
        .controller('alertingController', controller);

})(window, window.angular);