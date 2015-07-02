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
            controller: ['$scope', 'platformUpdateService', function ($scope, platformUpdateService) {
               
                var init = function () {

                    $scope.newversion = undefined;

                    platformUpdateService
                        .getReleases()
                        .then(function (result) {
   

                            if (result.data.length > 0) {
            
                                var r = window.semverUtils.parse(result.data[0]['tag']);
                                var i = window.semverUtils.parse($scope.version);

//                                i.major = '1';
//                                i.minor = '1';
//                                i.patch = '1';

                                var upgrade = !(   r['major'] === i['major']
                                                && r['minor'] === i['minor']
                                                && r['patch'] === i['patch']);

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
