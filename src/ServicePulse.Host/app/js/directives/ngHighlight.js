(function (window, angular, hljs) {
    'use strict';

    function Directive() {
        return {
            restrict: 'E',
            scope: {
                text: '='
            },
            template: '<pre><code></code></pre>',
            link: function(scope, element, attrs) {

                scope.$watch('text',
                    function() {
                        var codeTag = element.find('code')[0];
                        var languageCode = codeTag.parentNode.parentNode.getAttribute("lang");
                        codeTag.textContent = scope.text;
                        codeTag.className += ' language-' + languageCode;

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
