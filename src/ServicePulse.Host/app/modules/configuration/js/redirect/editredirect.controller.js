(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        $uibModalInstance,
        redirectService,
        toastService,
        notifyService,
        data,
        serviceControlService,
        endpointsService
    ) {
        var notifier = notifyService();

        $scope.loadingData = false;
        $scope.physicalAddress = {};
        if (data.redirect && data.redirect.message_redirect_id) {
            $scope.physicalAddress.selected = { physical_address: data.redirect.from_physical_address };
            $scope.to_physical_address = data.redirect.to_physical_address;
            $scope.message_redirect_id = data.redirect.message_redirect_id;
        } else {
            $scope.physicalAddress.selected = { physical_address: data.queueAddress };
            $scope.to_physical_address = '';
        }
        $scope.success = data.success;
        $scope.failure = data.error;
        $scope.title = data.title;
        $scope.saveButtonText = data.saveButtonText;

        $scope.endpoints = endpointsService.getQueueNames();

        notifier.subscribe($scope, function (event, data) {
            $scope.endpoints = data;
        }, 'EndpointsUpdated');
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        function isFormInvalid() {
            return $scope.redirectForm.$invalid || !$scope.physicalAddress.selected.physical_address;
        }

        $scope.createRedirect = function() {
            if (isFormInvalid()) {
                $scope.submitted = true;
                return;
            }

            if ($scope.message_redirect_id) {
                redirectService.updateRedirect($scope.message_redirect_id, $scope.physicalAddress.selected.physical_address, $scope.to_physical_address, $scope.success, $scope.failure).then(function (response) {
                    toastService.showInfo(response.message);
                    if ($scope.immediatelyRetry) {
                        serviceControlService.retryPendingMessagesForQueue($scope.physicalAddress.selected.physical_address);
                    }

                    $uibModalInstance.close();
                }, function(response) {
                    if (response.status === '409' || response.status === 409) {
                        toastService.showError('Failed to update a redirect, can not create redirect to a queue' + $scope.to_physical_address + ' as it already has a redirect. Provide a different queue or end the redirect.');
                    } else {
                        toastService.showError(response.message);
                    }
                });
            } else {
                redirectService.createRedirect($scope.physicalAddress.selected.physical_address, $scope.to_physical_address, $scope.success, $scope.failure).then(function (response) {
                    toastService.showInfo(response.message);
                    if ($scope.immediatelyRetry) {
                        serviceControlService.retryPendingMessagesForQueue($scope.physicalAddress.selected.physical_address);
                    }

                    $uibModalInstance.close();
                }, function(response) {
                    if ((response.status === '409' || response.status === 409) && response.statusText === 'Duplicate') {
                        toastService.showError('Failed to create a redirect, can not create more than one redirect for queue: ' + $scope.selected.physical_address);
                    } else if ((response.status === '409' || response.status === 409) && response.statusText === 'Dependents') {
                        toastService.showError('Failed to create a redirect, can not create a redirect to a queue that already has a redirect or is a target of a redirect.');
                    } else {
                        toastService.showError(response.message);
                    }
                });
            }
        };
    }

    controller.$inject = [
        '$scope',
        '$uibModalInstance',
        'redirectService',
        'toastService',
        'notifyService',
        'data',
        'serviceControlService',
        'endpointsService'
    ];

    angular.module('configuration.redirect')
        .controller('editRedirectController', controller);

})(window, window.angular);