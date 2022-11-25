(function (window, angular) {
    'use strict';

    function modalController($scope, $uibModalInstance, confirmMessage, confirmClick, confirmTitle, confirmOkOnly, confirmSecondParagraph) {

        $scope.title = confirmTitle ? confirmTitle : 'Confirm action';

        $scope.message = confirmMessage;

        $scope.secondParagraph = confirmSecondParagraph;

        $scope.showOkButtonOnly = confirmOkOnly ? confirmOkOnly : false;

        $scope.ok = function () {
            confirmClick();
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    function directive($log, $uibModal) {

        return {
            priority: -1,
            restrict: 'A',
            scope: {
                confirmTitle: '@',
                confirmMessage: '@',
                confirmClick: '&',
                confirmOkOnly: '@',
                confirmSecondParagraph: '@',
            },
            link: function (scope, element, attrs) {
                element.bind('click', function (e) {
                    $uibModal.open({
                        animation: true,
           
                        templateUrl: 'js/directives/ui.particular.confirmclick.tpl.html',
                        controller: modalController,
                        resolve: {
                            confirmMessage: function () {
                                return scope.confirmMessage;
                            },
                            confirmSecondParagraph: function () {
                                return scope.confirmSecondParagraph;
                            },
                            confirmClick: function () {
                                return scope.confirmClick;
                            },
                            confirmTitle: function() {
                                return scope.confirmTitle;
                            },
                            confirmOkOnly: function() {
                                return scope.confirmOkOnly;
                            }
                        }
                    });
                    e.stopPropagation();
                });
            }
        };
    }


    directive.$inject = ['$log', '$uibModal'];

    angular
        .module('ui.particular.confirmClick', [])
        .directive('confirmClick', directive);

}(window, window.angular));