(function (angular) {
    "use strict";

    function controller($scope) {
        var vm = this;
        vm.toggleSort = toggleSort;
        vm.$onInit = onInit; // attributes set by bindToController are only available during&after onInit
        
        function updateStatus() {
            var isActive = vm.ref.prop === vm.propertyName;
            if (isActive) {
                
                vm.sortIcon = vm.ref.expression.charAt(0) === "-"
                    ? "sort-down"
                    : "sort-up";
            }
            vm.isColumnActive = isActive;
        }

        function onInit() {
            vm.isColumnActive = updateStatus();
            $scope.$watch("vm.ref.expression", updateStatus);
        }

        function toggleSort() {
            vm.ref.prop = vm.propertyName;
            var defaultSortOrder = `-${vm.propertyName}`;
            if (vm.ref.expression === defaultSortOrder) {
                //invert sort order
                vm.ref.expression = `+${vm.propertyName}`;
            } else {
                vm.ref.expression = defaultSortOrder;
            }
        }
    }

    controller.$inject = ["$scope"];

    function directive() {
        return {
            scope: {
                propertyName: "=property",
                ref: "="
            },
            restrict: "E",
            controller: controller,
            controllerAs: "vm",
            bindToController: true,
            transclude: true,
            templateUrl: "modules/monitoring/js/directives/ui.particular.sortableColumn.tpl.html"
        }
    }

    angular
        .module("ui.particular.sortableColumn", [])
        .directive("sortableColumn", directive)
        .config(function ($logProvider) {
            $logProvider.debugEnabled(true);
        });


})(window.angular);