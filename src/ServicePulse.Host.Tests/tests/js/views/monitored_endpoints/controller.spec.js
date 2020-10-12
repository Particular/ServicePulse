describe("monitoredEndpointsCtrl", function () {
    beforeEach(module("sc"));

    var $controller,$rootScope,$location;

    beforeEach(inject(function(_$controller_, _$rootScope_, _$location_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $location = _$location_;
    }));

    describe("when passing filter query string", function() {
        it("should apply filter", function() {
            var scope = $rootScope.$new();
            $location.search().filter = "MyFilter";
            $controller("monitoredEndpointsCtrl",
                {
                    $scope: scope,
                    $location: $location
                });

            expect(scope.filter.name).toBe("MyFilter");
        });
    });

    describe("when changing filter value", function() {
        it("should update URL query parameter", function() {
            var scope = $rootScope.$new();
            $location.search().filter = "InitialValue";
            $controller("monitoredEndpointsCtrl",
                {
                    $scope: scope,
                    $location: $location
                });

            scope.filter.name = "NewValue";

            scope.$apply();
            expect($location.search().filter).toBe("NewValue");
        });
    });
});