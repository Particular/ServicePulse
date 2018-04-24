
; (function (window, angular, undefined) {
    'use strict';


    function controller($scope) {

        var selectActions = Object.freeze({
            Selection: 1,
            Deselection: 2
        });

        $scope.selectRow = (row, value) => {

            row.selected = value;
            $scope.updateSelectedIdsWithMessage(row);
        };

        $scope.selectWithShift = (row, index) => {
            var selectFromIndex = Math.min(index, $scope.multiselection.lastSelectedIndex);
            var selectToIndex = Math.max(index, $scope.multiselection.lastSelectedIndex);

            for (var i = selectFromIndex + 1; i <= selectToIndex; i++) {

                var selected = $scope.multiselection.lastAction === selectActions.Selection ? true : false;
                var r = $scope.messages[i];

                $scope.selectRow(r, selected);
            }

            $scope.multiselection.lastSelectedIndex = selectToIndex;

            if ($scope.selectedIds.length === 0) {
                $scope.multiselection.lastSelectedIndex = -1;
            }

            //Removes text selection that happens 
            //due to shift key being down.
            document.getSelection().removeAllRanges();
        };

        $scope.selectSingleRow = (row, index) => {
            var selected = !row.selected;
            $scope.selectRow(row, selected);

            if (selected) {
                $scope.multiselection.lastAction = selectActions.Selection;
            } else {
                $scope.multiselection.lastAction = selectActions.Deselection;
            }

            $scope.multiselection.lastSelectedIndex = index;

            if ($scope.selectedIds.length === 0) {
                $scope.multiselection.lastSelectedIndex = -1;
            }
        }

        $scope.toggleRowSelect = function (row, event, index) {

            if (event.shiftKey && $scope.multiselection.lastSelectedIndex > -1) {
                $scope.selectWithShift(row, index);
            } else {
                $scope.selectSingleRow(row, index);
            }

            //Stop event propagation since 
            //there are nested elements
            if (event.stopPropagation) event.stopPropagation();
            if (event.preventDefault) event.preventDefault();
            event.cancelBubble = true;
            event.returnValue = false;
        };

        $scope.updateSelectedIdsWithMessage = function (row) {
            if (row.selected) {
                $scope.selectedIds.push(row.id);
            } else {
                $scope.selectedIds.splice($scope.selectedIds.indexOf(row.id), 1);
            }
        };
    }
    
    controller.$inject = ['$scope'];

    function directive() {
        return {
            scope: { messages: '=messages', selectedIds: '=selectedIds', message: '=message', multiselection: '=multiselection' },
            restrict: 'E',
            templateUrl: 'js/directives/ui.particular.multi-checkboxlist.tpl.html',
            controller: controller
            
        };
    }

    directive.$inject = [];

    angular
        .module('ui.particular.multicheckboxList', [])
        .directive('multiCheckboxlist', directive);

}(window, window.angular, window.jQuery));

