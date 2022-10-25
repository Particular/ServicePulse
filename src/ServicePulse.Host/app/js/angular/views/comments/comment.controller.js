(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        $uibModalInstance,
        data,
        serviceControlService
    ) {
        $scope.comment = data.comment;
        $scope.group = data.group;

        $scope.success = data.success;
        $scope.failure = data.error;
        $scope.title = data.title;
        $scope.saveButtonText = data.saveButtonText;

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.createComment = function() {
            serviceControlService.editComment($scope.group.id, $scope.comment,
                'Comment editted succesfully',
                'Failed to change comment').then(function(){
                $uibModalInstance.close();
                $scope.group.comment = $scope.comment;
            });
        };
    }

    controller.$inject = [
        '$scope',
        '$uibModalInstance',
        'data',
        'serviceControlService'
    ];

    angular.module('sc')
        .controller('commentController', controller);

})(window, window.angular);