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

                        if(parentElement.id == '') {
                            parentElement.id = nextSnippetId;

                            highlightJsBadge({
                                contentSelector: '#' + nextSnippetId,
                                loadDelay:0,                
                                copyIconClass: 'fa fa-copy',
                                checkIconClass: 'fa fa-check text-success',
                            
                                // hook to allow modifying the text before it's pasted
                                onBeforeTextCopied: function(text, codeElement) {
                                return text;   //  you can fix up the text here
                                }
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
