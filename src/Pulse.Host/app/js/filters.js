'use strict';

/* Filters */

angular.module('sc.filters', []).
  filter('moment', [function() {
      return function(text) {
          return moment(text).fromNow();
      };
  }]);
