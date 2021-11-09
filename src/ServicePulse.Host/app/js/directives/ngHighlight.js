(function (window, angular, hljs) {
    'use strict';

    function Directive() {
        return {
            restrict: 'E',
            scope: {
                text: '=',
                lang: '='
            },
            template: '<pre><code></code></pre>',
            link: function(scope, element, attrs) {

                scope.$watch('text',
                    function() {
                        var codeTag = element.find('code')[0];
                        codeTag.innerText = scope.text;
                        codeTag.addClass('language-' + scope.lang);
                        hljs.highlightElement(codeTag);
                    }
                );
            }
        };
    }

    Directive.$inject = [];

    angular.module('ngHighlight', []).
        directive('highlight', Directive);

} (window, window.angular, window.hljs));
