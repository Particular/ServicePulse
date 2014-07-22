
'use strict';

angular.module('ngClipboard', []).
  directive('clipCopy', function () {
      return {
          scope: {
              clipComplete: '&',
              clipLoad: '&'
          },
          restrict: 'A',
          link: function (scope, element, attrs) {

              var clip = new ZeroClipboard(element);
              clip.on('ready', function () {
                  console.log('ready');
                  if (angular.isDefined(attrs.clipLoad)) {
                      scope.$apply(scope.clipLoad);
                  }
              });

              clip.on('aftercopy', function () {
                  console.log('copied data');
                  if (angular.isDefined(attrs.clipComplete)) {
                      scope.$apply(scope.clipComplete);
                  }
              });

              clip.on('error', function (e) {
                  console.log('error' + e.message );
                  return element.remove();
              });
          }
      };
  });
