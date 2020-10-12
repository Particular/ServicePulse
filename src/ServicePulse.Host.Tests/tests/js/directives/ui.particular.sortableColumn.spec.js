describe("Sortable Column", function() {
    beforeEach(module("sc"));

    var $controller, $rootScope, $compile;
    beforeEach(inject(function (_$controller_, _$rootScope_, _$compile_, $templateCache) {
        $templateCache.put("modules/monitoring/js/directives/ui.particular.sortableColumn.tpl.html", "<test></test>");
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $compile = _$compile_;
    }));

    describe("when selecting active column", function() {
        it("should toggle between ascending and descending ordering", function () {
            var parentScope = $rootScope.$new();
            parentScope.orderState = {
                prop: "myProperty",
                expression: "+myProperty"
            };

            var element = angular.element("<sortable-column ref='orderState' property=\"'myProperty'\">Hello World!</sortable-column>");
            $compile(element)(parentScope);
            $rootScope.$digest();

            var controller = element.controller("sortableColumn");

            // toggle
            controller.toggleSort();
            $rootScope.$digest();

            expect(parentScope.orderState.prop).toBe("myProperty");
            expect(parentScope.orderState.expression).toBe("-myProperty");
            expect(controller.isColumnActive).toBe(true);

            //toggle again
            controller.toggleSort();
            $rootScope.$digest();

            expect(parentScope.orderState.prop).toBe("myProperty");
            expect(parentScope.orderState.expression).toBe("+myProperty");
            expect(controller.isColumnActive).toBe(true);
        });
    });

    describe("when selecting inactive column", function () {
        it("should activate selected column", function () {
            var parentScope = $rootScope.$new();
            parentScope.orderState = {
                prop: "myOtherProperty",
                expression: "+myOtherProperty"
            };

            var element = angular.element("<sortable-column ref='orderState' property=\"'myProperty'\">Hello World!</sortable-column>");
            $compile(element)(parentScope);
            $rootScope.$digest();

            var controller = element.controller("sortableColumn");

            // toggle
            controller.toggleSort();
            $rootScope.$digest();

            expect(controller.isColumnActive).toBe(true);
            expect(parentScope.orderState.prop).toBe("myProperty");
            expect(parentScope.orderState.expression).toBe("-myProperty");
        });
    });

    describe("when other column is selected", function () {
        it("should deactivate current column", function () {
            var parentScope = $rootScope.$new();
            parentScope.orderState = {
                prop: "myProperty",
                expression: "+myProperty"
            };

            var element = angular.element("<sortable-column ref='orderState' property=\"'myProperty'\">Hello World!</sortable-column>");
            $compile(element)(parentScope);
            $rootScope.$digest();

            var controller = element.controller("sortableColumn");

            parentScope.orderState.prop = "someOtherProperty";
            parentScope.orderState.expression = "-someOtherProperty";
            $rootScope.$digest();

            expect(controller.isColumnActive).toBe(false);
        });
    });
});