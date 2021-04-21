(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        $uibModalInstance,
        alertingService,
        toastService
    ) {
        function refreshData() {
            alertingService.getSettings().then((alerting) => {
                $scope.settings = alerting;
            });
        }

        $scope.save = (alertingForm) => {
            if (alertingForm.$valid) {
                alertingService.updateSettings($scope.settings).then(
                    () => toastService.showInfo('Alerting settings updated.'),
                    () => toastService.showError('Failed not update settings.'));
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
        'alertingService',
        'toastService',
        'notifyService'
    ];

    angular.module('configuration.alerting')
        .controller('editEmailController', controller);

})(window, window.angular);