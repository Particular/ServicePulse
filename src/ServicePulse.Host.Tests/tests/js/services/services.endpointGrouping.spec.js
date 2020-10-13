describe("endpointGroupingService", function() {
    beforeEach(module("sc"));

    var service;

    beforeEach(inject(function (_endpointGrouping_) {
        service = _endpointGrouping_;

    }));

    beforeEach(function() {
        return;
    });

    it("returns no groups on empty input", function () {
        console.log(service);
        var result = service.group([]);
        expect(result).toBe([]);
    });
    
});