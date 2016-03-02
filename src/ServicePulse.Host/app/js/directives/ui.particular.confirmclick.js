; (function (window, angular, undefined) {
    'use strict';

    function modalController($scope, $uibModalInstance, confirmMessage, confirmClick) {

        $scope.title = 'Confirm action';

        $scope.message = confirmMessage;

        $scope.ok = function () {
            confirmClick();
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    function directive($log, $uibModal) {

        return {
            priority: -1,
            restrict: 'A',
            scope: {
                confirmMessage: '@',
                confirmClick: '&'
            },
            link: function (scope, element, attrs) {
                element.bind('click', function (e) {
                    $uibModal.open({
                        animation: true,
           
                        templateUrl: 'js/directives/ui.particular.confirmClick.tpl.html',
                        controller: modalController,
                        resolve: {
                            confirmMessage: function () {
                                return scope.confirmMessage;
                            },
                            confirmClick: function () {
                                return scope.confirmClick;
                            }
                        }
                    });
                });
            }
        };
    }


    directive.$inject = ['$log', '$uibModal'];

    angular
        .module('ui.particular.confirmClick', [])
        .directive('confirmClick', directive);

}(window, window.angular));