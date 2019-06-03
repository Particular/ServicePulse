; (function (window, angular, undefined) {
    'use strict';

    function controller(
        messageId,
        $uibModalInstance,
        $scope) {
        console.debug('messageId: ', messageId);

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }

    controller.$inject = [
        'messageId',
        '$uibModalInstance',
        '$scope',
    ];

    angular.module("sc")
        .controller("messageEditorModalController", controller);

})(window, window.angular);