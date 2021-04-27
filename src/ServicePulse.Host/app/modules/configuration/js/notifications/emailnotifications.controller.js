(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        $uibModalInstance,
        notificationsService,
        toastService
    ) {
        function refreshData() {
            notificationsService.getSettings().then((notifications) => {
                $scope.settings = notifications;
            });
        }

        $scope.save = (notificationsForm) => {
            if (notificationsForm.$valid) {
                notificationsService.updateSettings($scope.settings).then(
                    () => {
                        toastService.showInfo('Email settings updated.');
                        $uibModalInstance.dismiss('saved');
                    },
                    () => toastService.showError('Failed to update the email settings.'));
            }
        };
 
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
        
        refreshData();
    }

    controller.$inject = [
        '$scope',
        '$uibModalInstance',
        'notificationsService',
        'toastService',
        'notifyService'
    ];

    angular.module('configuration.notifications')
        .controller('editEmailController', controller);

})(window, window.angular);
