(function (window, angular, hljs) {
    'use strict';

    var counter = 0; //used to generate unique identifiers for code samples

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

                        var nextSnippetId = 'hljs' + (counter++);
                        var parentElement = element.find('pre')[0];

                        //This prevents double-initialization of highlightJsBadge
                        if(parentElement.id == '') {
                            parentElement.id = nextSnippetId;

                            highlightJsBadge({
                                contentSelector: '#' + nextSnippetId,
                            });
                        }
                    }
                );
            }
        };
    }

    Directive.$inject = [];

    angular.module('ngHighlight', []).
        directive('highlight', Directive);

} (window, window.angular, window.hljs));
