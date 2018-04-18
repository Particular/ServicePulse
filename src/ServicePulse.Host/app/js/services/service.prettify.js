; (function (window, angular, undefined) {
    'use strict';

    function service($jquery) {
        
        this.prettifyText = function (text) {
            if ((typeof text === 'object' && text.constructor === Object) || isJSON(text) ) {
                return vkbeautify.json(text);
            }
            if (isXML(text, $jquery)) {
                return vkbeautify.xml(text);
            }
            return text;
        }
    }

    function isJSON(str) {
        try {
            return (JSON.parse(str) && !!str);
        } catch (e) {
            return false;
        }
    }

    function isXML(str, $jquery) {
        try {
            return ($jquery.parseXml(str));
        } catch (e) {
            return false;
        }
    }

    service.$inject = [
        '$jquery'
    ];

    angular.module('sc')
        .service('prettifyService', service);

} (window, window.angular));