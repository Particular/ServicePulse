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
        if (data.redirect) {
            $scope.from_physical_address = data.redirect.from_physical_address;
            $scope.to_physical_address = data.redirect.to_physical_address;
            $scope.message_redirect_id = data.redirect.message_redirect_id;
        } else {
            $scope.from_physical_address = '';
            $scope.to_physical_address = '';
        }
        $scope.title = data.title;

        $scope.availableEndpoints = [];

        $scope.getAvailableEndpoints = function(searchPhrase) {
            if (searchPhrase.length < 3)
                return;
            return serviceControlService.getQueueNames(searchPhrase);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.createRedirect = function (success, failure) {
            if ($scope.message_redirect_id) {
                redirectService.updateRedirect($scope.message_redirect_id, $scope.from_physical_address, $scope.to_physical_address, success, failure).then(function (reason) {
                    toastService.showInfo(success + ":" + reason);
                    $uibModalInstance.close();
                }, function (reason, status) {
                    if (status === '409' || status === 409) {
                        toastService.showError('Failed to create a redirect, can not create more than one redirect for queue: ' + $scope.from_physical_address);
                    } else {
                        toastService.showError(failure + ":" + reason);
                    }
                    
                });
            } else {
                redirectService.createRedirect($scope.sourceEndpoint, $scope.targetEndpoint, success, failure).then(function (reason) {
                    toastService.showInfo(success + ":" + reason);
                    $uibModalInstance.close();
                }, function (reason, status) {
                    if (status === '409' || status === 409) {
                        toastService.showError('Failed to create a redirect, can not create more than one redirect for queue:' + $scope.from_physical_address);
                    } else {
                        toastService.showError(failure + ":" + reason);
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