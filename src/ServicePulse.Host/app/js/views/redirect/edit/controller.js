;
(function (window, angular, undefined) {
    "use strict";
    
    function controller(
        $scope,
        $uibModalInstance,
        redirectService,
        toastService,
        data,
        serviceControlService) {

        $scope.loadingData = false;
        if (data.redirect && data.redirect.message_redirect_id) {
            $scope.from_physical_address = data.redirect.from_physical_address;
            $scope.to_physical_address = data.redirect.to_physical_address;
            $scope.message_redirect_id = data.redirect.message_redirect_id;
        } else {
            $scope.from_physical_address = '';
            $scope.to_physical_address = '';
        }
        $scope.success = data.success;
        $scope.failure = data.error;
        $scope.title = data.title;
        $scope.saveButtonText = data.saveButtonText;

        $scope.availableEndpoints = [];

        $scope.getAvailableEndpoints = function(searchPhrase) {
            if (searchPhrase.length < 3)
                return;

            return serviceControlService.getQueueNames(searchPhrase).then(function(results) {
                return results.map(function(item) {
                    return item.physical_address;
                });
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.createRedirect = function () {
            if ($scope.redirectForm.$invalid)
                return;

            if ($scope.message_redirect_id) {
                redirectService.updateRedirect($scope.message_redirect_id, $scope.from_physical_address, $scope.to_physical_address, $scope.success, $scope.failure).then(function(response) {
                    toastService.showInfo(response.message);
                    $uibModalInstance.close();
                }, function(response) {
                    if ((response.status === '409' || response.status === 409) && response.statusText === 'Duplicate') {
                        toastService.showError('Failed to update a redirect, can not create more than one redirect for queue: ' + $scope.from_physical_address);
                    } else if ((response.status === '409' || response.status === 409) && response.statusText === 'Dependents') {
                        toastService.showError('Failed to update a redirect, can not create redirect to a queue that already has a redirect or is a target of a redirect.');
                    }
                    else
                    {
                        toastService.showError(response.message);
                    }
                });
            } else {
                redirectService.createRedirect($scope.from_physical_address, $scope.to_physical_address, $scope.success, $scope.failure).then(function (response) {
                    toastService.showInfo(response.message);
                    $uibModalInstance.close();
                }, function (response) {
                    if (response.status === '409' || response.status === 409) {
                        toastService.showError('Failed to create a redirect, can not create more than one redirect for queue:' + $scope.from_physical_address);
                    } else {
                        toastService.showError(response.message);
                    }
                });
            }
        }
    }

    controller.$inject = [
        "$scope",
        "$uibModalInstance",
        "redirectService",
        "toastService",
        "data",
        "serviceControlService"
    ];

    angular.module("sc")
        .controller("editRedirectController", controller);

})(window, window.angular);