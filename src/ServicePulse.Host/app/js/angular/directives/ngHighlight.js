(function (window, angular, hljs) {
    'use strict';

    var counter = 0; //used to generate unique identifiers for code samples
    var hljsBgInitialized = false;

    function AddHljsBadgeTemplate(){
        var template =
        '<div id="CodeBadgeTemplate" style="display:none">' +
        '   <div class="code-badge">' +
        '       <div class="code-badge-language">Copy</div>' +
        '       <div title="Copy to clipboard">' +
        '           <i class="{{copyIconClass}} code-badge-copy-icon"></i>' +
        '       </div>' +
        '   </div> /' +
        '/div>`'
        
        var div = document.createElement('div');
        div.innerHTML = template;
        window.document.body.appendChild(div.firstChild);
    }
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

                        //No ids are assigend so the view has just been re-created
                        if($('highlight > pre[id]').length == 0)
                        {
                            hljsBgInitialized = false;
                        }

                        element.find('pre')[0].id = 'hljs' + (counter++);

                        //This prevents double-initialization of highlightJsBadge
                        if($('highlight > pre:not([id])').length == 0 && hljsBgInitialized == false) {
                            AddHljsBadgeTemplate();
                            window.highlightJsBadge({});
                            hljsBgInitialized = true;
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
