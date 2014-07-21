'use strict';

angular.module('ngClipboard', []).
  value('ZeroClipboardConfig', {
     swfpath: '/lib/ZeroClipboard.swf'
  }).
  directive('clipCopy', ['ZeroClipboardConfig', function () {
      return {
          scope: {
              clipComplete: '&',
              clipLoad: '&'
          },
          restrict: 'A',
          link: function (scope, element, attrs) {
              // Create the clip object
              var clip = new ZeroClipboard(element);

              clip.on('load', function () {
                  console.log("loaded");
                  if (angular.isDefined(attrs.clipLoad)) {
                      scope.$apply(scope.clipLoad);
                  }
              });
              clip.on('complete', function () {
                  console.log("loaded");
                  if (angular.isDefined(attrs.clipComplete)) {
                      scope.$apply(scope.clipComplete);
                  }
                  console.log('Copy button 2');
              });
              clip.on("noflash wrongflash", function() {
                  return element.remove();
              });
          }
      };
  }]);