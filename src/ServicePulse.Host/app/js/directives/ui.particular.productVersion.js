; (function (window, angular, undefined) {
    'use strict';

    function Controller($scope, platformUpdateService, semverService) {
        var init = function () {

            $scope.newversion = undefined;

            platformUpdateService
                .getReleases()
                .then(function (result) {

                    if (result.data.length > 0) {

                        var upgrade = semverService.isUpgradeAvailable($scope.version, result.data[0]['tag']);

                        if (upgrade) {
                            $scope.newversion = true;
                            $scope.newversionlink = result.data[0]['release'];
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