(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        notificationsService,
        notifyService,
        toastService,
        $uibModal) {

        var vm = this;
        var notifier = notifyService();

        notifier.subscribe($scope, (event, response) => {
            vm.notifications = response.notifications;
        }, 'EmailNotificationsUpdated');

        function refreshData() {
            notificationsService.getSettings().then((notifications) => {
                vm.notifications = notifications;
            });
        }

        vm.notifications = {};
        vm.testInProgress = false;

        vm.toogleEmailNotifications = () => {
            var emailNotificationsOn = !vm.notifications.alerting_enabled;

            notificationsService.toogleEmailNotifications(emailNotificationsOn).then(
                () => {
                    toastService.showInfo('Email notifications are now turned ' + (emailNotificationsOn ? 'on.' : 'off.')),
                    vm.notifications.alerting_enabled = emailNotificationsOn;
                },
                () => toastService.showError('Failed to update settings.')
            );
        };

        vm.editEmailNotifications = () => {
            const template = require('../../views/notificationsemailmodal.html');

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
            vm.emailTestInProgress = true;
            notificationsService.testEmailNotifications().then(
                () => {
                    vm.emailTestInProgress = false;
                    vm.emailTestSuccessful = true;
                },
                (error) => {
                    toastService.showError(error.data);
                    vm.emailTestInProgress = false;
                    vm.emailTestFailure = true;
                }
            );
        };

        refreshData();
    }

    controller.$inject = [
        '$scope',
        'notificationsService',
        'notifyService',
        'toastService',
        '$uibModal'
    ];

    angular.module('configuration.notifications')
        .controller('notificationsController', controller);

})(window, window.angular);