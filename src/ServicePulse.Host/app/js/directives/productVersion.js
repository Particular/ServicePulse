(function () {

angular.module('directives.productVersion', [])
    .directive('productVersion', function () {
        return {
            scope: {
                version: '@',
                scversion: '@'
            },
            restrict: 'AEM',
            replace: true,
            templateUrl: 'js/directives/productVersion.tpl.html',
            controller: ['$scope', 'platformUpdateService', 'semverService',
                function ($scope, platformUpdateService, semverService) {
               
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
            }],
            link: function (scope, element) {

               
            }
        };
    });
}());