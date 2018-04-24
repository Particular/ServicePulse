describe('Multi checkbox list', function () {
    'use strict';
    beforeEach(module('sc'));
    beforeEach(module('ui.particular.multicheckboxList'));

    var el;

    beforeEach(inject(function ($compile, $rootScope, $httpBackend, $templateCache) {
    // this line make sure that template is loaded, I am replacing the real one with fake, as it is not important for the test
        $templateCache.put('js/directives/ui.particular.multi-checkboxlist.tpl.html', '<div class="check col-xs-1"></div>');
        el = angular.element("<multi-checkboxlist></multi-checkboxlist>");
        $compile(el)($rootScope.$new());
        $rootScope.$digest();
    }));

    describe('toggle selected', function () {
        var $scope, controller;

        beforeEach(function () {
            controller = el.controller("multiCheckboxlist");
            $scope = el.isolateScope() || el.scope();
            $scope.multiselection = { lastAction: false, lastSelectedIndex: -1 };
            $scope.selectedIds = [];
        });

        it('select row if it was not seleted', function () {

            var row = { selected: false, id: 1 };
            $scope.messages = [row];

            $scope.toggleRowSelect(row, { shiftKey: false }, 0);

            expect($scope.selectedIds.length).toEqual(1);
            expect(row.selected).toEqual(true);
        });

        it('unselect row if it was seleted', function () {

            var row = { selected: true, id: 1 };
            $scope.messages = [row];
            $scope.selectedIds = [1];

            $scope.toggleRowSelect(row, { shiftKey: false }, 0);

            expect($scope.selectedIds.length).toEqual(0);
            expect(row.selected).toEqual(false);
        });

        it('select 3 out of 5 rows using shift', function () {
            $scope.messages = [{ selected: false, id: 1 },
                { selected: false, id: 2 },
                { selected: false, id: 3 },
                { selected: false, id: 4 },
                { selected: false, id: 5 }
            ];

            $scope.toggleRowSelect($scope.messages[1], { shiftKey: false }, 1);
            $scope.toggleRowSelect($scope.messages[3], { shiftKey: true }, 3);

            expect($scope.selectedIds.length).toEqual(3);
            expect($scope.messages[0].selected).toEqual(false);
            expect($scope.messages[1].selected).toEqual(true);
            expect($scope.messages[2].selected).toEqual(true);
            expect($scope.messages[3].selected).toEqual(true);
            expect($scope.messages[4].selected).toEqual(false);
        });

        it('unselect 3 out of 5 rows using shift', function () {
            $scope.messages = [{ selected: true, id: 1 },
                { selected: true, id: 2 },
                { selected: true, id: 3 },
                { selected: true, id: 4 },
                { selected: true, id: 5 }
            ];
            $scope.selectedIds = [1, 2, 3, 4, 5];

            $scope.toggleRowSelect($scope.messages[1], { shiftKey: false }, 1);
            $scope.toggleRowSelect($scope.messages[3], { shiftKey: true }, 3);

            expect($scope.selectedIds.length).toEqual(2);
            expect($scope.messages[0].selected).toEqual(true);
            expect($scope.messages[1].selected).toEqual(false);
            expect($scope.messages[2].selected).toEqual(false);
            expect($scope.messages[3].selected).toEqual(false);
            expect($scope.messages[4].selected).toEqual(true);
        });

        it('select 3 out of 5 rows using shift - reverse order', function () {
            $scope.messages = [{ selected: false, id: 1 },
            { selected: false, id: 2 },
            { selected: false, id: 3 },
            { selected: false, id: 4 },
            { selected: false, id: 5 }
            ];

            $scope.toggleRowSelect($scope.messages[3], { shiftKey: false }, 3);
            $scope.toggleRowSelect($scope.messages[1], { shiftKey: true }, 1);

            expect($scope.selectedIds.length).toEqual(3);
            expect($scope.messages[0].selected).toEqual(false);
            expect($scope.messages[1].selected).toEqual(true);
            expect($scope.messages[2].selected).toEqual(true);
            expect($scope.messages[3].selected).toEqual(true);
            expect($scope.messages[4].selected).toEqual(false);
        });

        it('unselect 3 out of 5 rows using shift - reverse order', function () {
            $scope.messages = [{ selected: true, id: 1 },
            { selected: true, id: 2 },
            { selected: true, id: 3 },
            { selected: true, id: 4 },
            { selected: true, id: 5 }
            ];
            $scope.selectedIds = [1, 2, 3, 4, 5];

            $scope.toggleRowSelect($scope.messages[3], { shiftKey: false }, 3);
            $scope.toggleRowSelect($scope.messages[1], { shiftKey: true }, 1);

            expect($scope.selectedIds.length).toEqual(2);
            expect($scope.messages[0].selected).toEqual(true);
            expect($scope.messages[1].selected).toEqual(false);
            expect($scope.messages[2].selected).toEqual(false);
            expect($scope.messages[3].selected).toEqual(false);
            expect($scope.messages[4].selected).toEqual(true);
        });

        it('select 3 out of 5 rows using shift, when middle element was selected', function () {
            $scope.messages = [{ selected: false, id: 1 },
            { selected: false, id: 2 },
            { selected: false, id: 3 },
            { selected: false, id: 4 },
            { selected: false, id: 5 }
            ];
            
            $scope.toggleRowSelect($scope.messages[2], { shiftKey: false }, 2);
            $scope.toggleRowSelect($scope.messages[1], { shiftKey: false }, 1);
            $scope.toggleRowSelect($scope.messages[3], { shiftKey: true }, 3);

            expect($scope.selectedIds.length).toEqual(3);
            expect($scope.messages[0].selected).toEqual(false);
            expect($scope.messages[1].selected).toEqual(true);
            expect($scope.messages[2].selected).toEqual(true);
            expect($scope.messages[3].selected).toEqual(true);
            expect($scope.messages[4].selected).toEqual(false);
        });

        it('unselect 3 out of 5 rows using shift, when middle element was unselected', function () {
            $scope.messages = [{ selected: true, id: 1 },
            { selected: true, id: 2 },
            { selected: true, id: 3 },
            { selected: true, id: 4 },
            { selected: true, id: 5 }
            ];
            $scope.selectedIds = [1, 2, 3, 4, 5];

            $scope.toggleRowSelect($scope.messages[2], { shiftKey: false }, 2);
            $scope.toggleRowSelect($scope.messages[1], { shiftKey: false }, 1);
            $scope.toggleRowSelect($scope.messages[3], { shiftKey: true }, 3);

            expect($scope.selectedIds.length).toEqual(2);
            expect($scope.messages[0].selected).toEqual(true);
            expect($scope.messages[1].selected).toEqual(false);
            expect($scope.messages[2].selected).toEqual(false);
            expect($scope.messages[3].selected).toEqual(false);
            expect($scope.messages[4].selected).toEqual(true);
        });
    });
});