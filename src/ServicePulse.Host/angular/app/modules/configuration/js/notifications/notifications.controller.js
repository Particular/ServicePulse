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
        
        vm.notifications = {};

        notifier.subscribe($scope, (event, response) => {
            vm.notifications = response.notifications;
        }, 'NotificationsConfigurationUpdated');

        function refreshData() {
            notificationsService.getSettings().then((notifications) => {
                vm.notifications = notifications;
            });
        }

        vm.toogleEmailNotifications = () => {
            var emailNotificationsOn = !vm.notifications.enabled;

            notificationsService.toogleEmailNotifications(emailNotificationsOn).then(
                () => vm.notifications.enabled = emailNotificationsOn,
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
            vm.emailTestSuccessful = false;
            vm.emailTestFailure = false;

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