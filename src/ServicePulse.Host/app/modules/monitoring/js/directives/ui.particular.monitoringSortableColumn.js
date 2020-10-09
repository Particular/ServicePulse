(function (angular) {
    'use strict';

    function controller($scope) {
        $scope.toggleSort = toggleSort;
        $scope.isColumnActive = updateStatus();

        $scope.$watch("ref.expression", updateStatus);

        function updateStatus() {
            var isActive = $scope.ref.prop === $scope.propertyName;
            if (isActive) {
                
                $scope.sortIcon = $scope.ref.expression.charAt(0) === '-'
                    ? 'glyphicon-arrow-down'
                    : 'glyphicon-arrow-up';
            }
            $scope.isColumnActive = isActive;
        }

        function toggleSort() {
            $scope.ref.prop = $scope.propertyName;
            var defaultSortOrder = `-${$scope.propertyName}`;
            if ($scope.ref.expression === defaultSortOrder) {
                //invert sort order
                $scope.ref.expression = `+${$scope.propertyName}`;
            } else {
                $scope.ref.expression = defaultSortOrder;
            }
        }
    }

    controller.$inject = ['$scope'];

    function directive() {
        return {
            scope: {
                propertyName: '=property',
                ref: '='
            },
            restrict: 'E',
            controller: controller,
            //replace: true,
            transclude: true,
            templateUrl: 'modules/monitoring/js/directives/ui.particular.monitoringSortableColumn.tpl.html'
        }
    }

    angular
        .module('ui.particular.monitoringSortableColumn', [])
        .directive('sortableColumn', directive)
        .config(function ($logProvider) {
            $logProvider.debugEnabled(true);
        });


})(window.angular);