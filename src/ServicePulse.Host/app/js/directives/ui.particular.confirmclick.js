; (function (window, angular, undefined) {
    'use strict';

    var modalcontroller = function ($scope, $uibModalInstance, message) {

        $scope.title = 'Confirm action';

        $scope.message = message;
        $scope.ok = function () {
            $uibModalInstance.close('ok');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }


    function directive($log, $uibModal) {

        return {
            priority: -1,
            link: function (scope, element, attrs) {
                element.bind('click', function (e) {
               
      
                    var modalInstance =  $uibModal.open({
                        animation: true,
                        templateUrl: 'js/directives/ui.particular.confirmClick.tpl.html',
                        controller: modalcontroller,
                        resolve: {
                                message: function () {
                                    return attrs.confirmClick;
                            }
                        }
                    });
                        
                    modalInstance.result.then(function (ok) {
                        $log.info('Modal close with ok at: ' + new Date());
                    }, function () {
                        $log.info('Modal close with cancel at: ' + new Date());
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    });

                
                });
            },
            restrict: 'EA'
        };
    }


    directive.$inject = ['$log', '$uibModal'];

    angular
        .module('ui.particular.confirmClick', [])
        .directive('confirmClick', directive);

} (window, window.angular));