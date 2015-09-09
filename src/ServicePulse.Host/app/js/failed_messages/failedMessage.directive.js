(function() {
    'use strict';

    function myDirective($window) {

        var controller = function () {
            var vm = this;

            function init() {
                vm.item = vm.dataitem;
            }

            init();
        };

        var directive = {
            restrict: 'E',
            replace: true,
            controller: controller,
            controllerAs: 'ctrl',
            scope: {
                dataitem: '=',
                datasource: '=',
                selectedId: '='
            },
            bindToController: true,
            templateUrl: function (elem, attrs) {
                return attrs.templateUrl || 'js/failed_messages/failedMessage.directive.tpl.html';
            }
        };
        return directive;

    }

    myDirective.$inject = ['$window'];

    angular
        .module('failedMessages')
        .directive('failedMessage', myDirective);

    
    
  
})();


//<failed-message dataitem='p'
//datasource='model.exceptionGroups'
//selectedId='selectedExceptionGroup.id'>  
//</failed-message>