(function (window, angular) {
    'use strict';

    function Controller($scope,
        platformUpdateService,
        semverService) {
        var init = function () {

            $scope.newversion = undefined;

            platformUpdateService
                .getReleases()
                .then(function (result) {

                    if (Object.prototype.hasOwnProperty.call(result, 'SP')) {
                        if (semverService.isUpgradeAvailable($scope.version, result.SP[0]['tag'])) {
                            $scope.newspversion = true;
                            $scope.newspversionlink = result.SP[0]['release'];
                            $scope.newspversionnumber = result.SP[0]['tag'];
                        }
                    }

                    if (Object.prototype.hasOwnProperty.call(result, 'SC')) {
                        if (semverService.isUpgradeAvailable($scope.scversion, result.SC[0]['tag'])) {
                            $scope.newscversion = true;
                            $scope.newscversionlink = result.SC[0]['release'];
                            $scope.newscversionnumber = result.SC[0]['tag'];
                        }

                        // monitoring version binds much later than SC version, so we need to respond when it changes
                        $scope.$watch('scmonitoringversion', function () {
                            if (semverService.isUpgradeAvailable($scope.scmonitoringversion, result.SC[0]['tag'])) {
                                $scope.newscmonitoringversion = true;
                                $scope.newscmonitoringversionlink = result.SC[0]['release'];
                                $scope.newscmonitoringversionnumber = result.SC[0]['tag'];
                            }
                        });
                    }
                });
        };

        init();
    }

    Controller.$inject = ['$scope', 'platformUpdateService', 'semverService'];

    function Directive() {
        return {
            scope: {
                version: '@',
                scversion: '@',
                scmonitoringversion: '@'
            },
            restrict: 'AEM',
            replace: true,
            templateUrl: 'js/directives/ui.particular.productVersion.tpl.html',
            controller: Controller,
            link: function (scope, element) { }
        };
    }

    Directive.$inject = [];

    angular.module('ui.particular.productVersion', [])
        .directive('productVersion', Directive);

} (window, window.angular));
