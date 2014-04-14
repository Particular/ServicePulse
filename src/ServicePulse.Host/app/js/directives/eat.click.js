'use strict';

angular.module('directives.eatClick', [])
    .directive('eatClick', function () {
    return function(scope, element) {
        $(element).click(function(event) {
            event.preventDefault();
            event.stopPropagation();
        });
    };
})