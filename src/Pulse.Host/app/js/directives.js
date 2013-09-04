'use strict';

/* Directives */


angular.module('sc.directives', []).
  directive('moment', ['$timeout', function($timeout) {
      return {        
          restrict: 'C',
          link: function(scope, element, attr) {
              //$timeout.setTimeout();
          }
      };
  }]);
