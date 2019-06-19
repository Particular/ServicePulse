; (function (window, angular, $, undefined) {
    'use strict';

    function directive() {

        return {
            link: function (scope, elem, attrs) {
                var allowEdit = attrs.editOnFocus !== "false";
                if(allowEdit){
                    elem.on('focus', function (e) {
                        e.srcElement.readOnly = false;
                    });
    
                    elem.on('blur', function (e) {
                        e.srcElement.readOnly = true;
                    });
                }
            }
        };
    }

    angular
        .module('ui.particular.editOnFocus', [])
        .directive('editOnFocus', directive);

}(window, window.angular, window.jQuery));