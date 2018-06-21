;
(function (window, angular, $, undefined) {
    'use strict';

    function Service() {

        function parseTheMessageTypeData(messageType) {
            if (!messageType.typeName)
                return;

            if (messageType.typeName.indexOf(';') > 0) {
                var messageTypeHierarchy = messageType.typeName.split(';');
                messageTypeHierarchy = messageTypeHierarchy.map((item) => {
                    var obj = {};
                    var segments = item.split(',');
                    obj.typeName = segments[0];
                    obj.assemblyName = segments[1];
                    obj.assemblyVersion = segments[2].substring(segments[2].indexOf('=') + 1);
                    
                    if (!segments[4].endsWith('=null')) { //SC monitoring fills culture only if PublicKeyToken is filled
                        obj.culture = segments[3];
                        obj.publicKeyToken = segments[4];
                    }
                    return obj;
                });
                messageType.messageTypeHierarchy = messageTypeHierarchy;
                messageType.typeName =
                    messageTypeHierarchy.reduce((sum, item) => (sum ? `${sum}, ` : '') + item.typeName, '');
                messageType.containsTypeHierarchy = true;
                messageType.tooltipText = messageTypeHierarchy.reduce((sum, item) => (sum ? `${sum}<br> ` : '') +
                    `${item.typeName} |${item.assemblyName}-${item.assemblyVersion}` + (item.culture ? ` |${item.culture}` : '') + (item.publicKeyToken ? ` |${item.publicKeyToken}` : ''),
                    '');
            } else {
                var tooltip = `${messageType.typeName} | ${messageType.assemblyName}-${messageType.assemblyVersion}`;
                if (messageType.culture && messageType.culture != 'null') {
                    tooltip += ` | Culture=${messageType.culture}`;
                }

                if (messageType.publicKeyToken && messageType.publicKeyToken != 'null') {
                    tooltip += ` | PublicKeyToken=${messageType.publicKeyToken}`;
                }

                messageType.tooltipText = tooltip;
            }
        }
    
        var service = {
            parseTheMessageTypeData: parseTheMessageTypeData
        };

        return service;
    }

    Service.$inject = [];

    angular.module('services.messageTypeParser', ['sc'])
        .service('messageTypeParser', Service);
}(window, window.angular, window.jQuery));
