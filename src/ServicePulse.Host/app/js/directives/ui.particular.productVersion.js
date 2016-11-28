; (function (window, angular, undefined) {
    'use strict';

    function Controller($scope, platformUpdateService, semverService) {
        var init = function () {

            $scope.newversion = undefined;

            platformUpdateService
                .getReleases()
                .then(function (result) {

                    if (result.hasOwnProperty('SP')) {
                        if (semverService.isUpgradeAvailable($scope.version, result.SP[0]['tag'])) {
                            $scope.newspversion = true;
                            $scope.newspversionlink = result.SP[0]['release'];
                            $scope.newspversionnumber = result.SP[0]['tag'];
                        }
                    }

                    if (result.hasOwnProperty('SC')) {
                        if (semverService.isUpgradeAvailable($scope.scversion, result.SC[0]['tag'])) {
                            $scope.newscversion = true;
                            $scope.newscversionlink = result.SC[0]['release'];
                            $scope.newscversionnumber = result.SC[0]['tag'];
                        }
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
                scversion: '@'
            },
            restrict: 'AEM',
            replace: true,
            templateUrl: 'js/directives/ui.particular.productVersion.tpl.html',
            controller: Controller,
            link: function (scope, element) { }
        };
    };

    Directive.$inject = [];

    angular.module('ui.particular.productVersion', [])
        .directive('productVersion', Directive);

} (window, window.angular));