'use strict';

angular.module('ngClipboard', []).
  value('ZeroClipboardConfig', {
      path: '/lib/ZeroClipboard.swf'
  }).
  directive('clipCopy', ['ZeroClipboardConfig', function (zeroClipboardConfig) {
      return {
          scope: {
              clipCopy: '&',
              clipClick: '&'
          },
          restrict: 'A',
          link: function (scope, element, attrs) {
              // Create the clip object
              var clip = new ZeroClipboard(element, {
                  moviePath: zeroClipboardConfig.path,
                  allowScriptAccess: "always"
              });

              clip.on('mousedown', function (client) {
                  client.setText(scope.$eval(scope.clipCopy));
                  if (angular.isDefined(attrs.clipClick)) {
                      scope.$apply(scope.clipClick);
                  }
              });
          }
      };
  }]);