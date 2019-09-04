(function (window, angular) {
    'use strict';


    function Controller() {
        var self = this;
        self.tabs = [];

        self.addTab = function (tab) {
            self.tabs.push(tab);

            if (self.tabs.length === 1) {

                tab.active = true;
            }
        }

        self.select = function (selectedTab) {
            if (selectedTab.disabled) { return }

            angular.forEach(self.tabs, function (tab) {
                if (tab.active && tab !== selectedTab) {
                    tab.active = false;
                }
            });

            selectedTab.active = true;
        }
    }

    function link(scope, element, attrs) {

    }

    function Directive($window) {

        var directive = {
            restrict: 'E',
            transclude: true,
            scope: {

            },
            templateUrl: 'js/directives/ui.particular.tabset.tpl.html',
            bindToController: true,
            controllerAs: 'tabset',
            controller: Controller,
            link: link
        };

        return directive;
    }

    Directive.$inject = ['$window'];

    angular
        .module('ui.particular.tabset', [])
        .directive('tabset', Directive);

} (window, window.angular));

