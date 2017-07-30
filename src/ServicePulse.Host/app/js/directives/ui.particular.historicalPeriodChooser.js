; (function (window, angular, undefined) {
    'use strict';


    function Controller(monitoringService) {
        var self = this;
        self.items =
        [
            { value: 5, text: "Last 5 min." },
            { value: 10, text: "Last 10 min." },
            { value: 15, text: "Last 15 min." },
            { value: 30, text: "Last 30 min." },
            { value: 60, text: "Last hour" }
        ];

        self.select = function(item) {
            self.selected = item;
            monitoringService.changeHistoryPeriod(item.value);
        };

        self.select(self.items[0]);
    }

    function link(scope, element, attrs) {

    }

    function Directive() {

        var directive = {
            restrict: 'E',
            transclude: true,
            scope: {

            },
            templateUrl: 'js/directives/ui.particular.historicalPeriodChooser.tpl.html',
            bindToController: true,
            controllerAs: 'periods',
            controller: Controller,
            link: link
        };

        return directive;
    }

    Controller.$inject = ['monitoringService'];

    angular
        .module('ui.particular.historicalPeriodChooser', [])
        .directive('historicalPeriodChooser', Directive);

} (window, window.angular));

