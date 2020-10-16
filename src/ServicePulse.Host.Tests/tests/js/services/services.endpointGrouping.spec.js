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
        var result = service.group([]);
        expect(result).toEqual([]);
    });

    it("groups endpoints by defined number of segments", function () {
        var endpoints = [
            { name: 'Universe.MilkyWay.SolarSystem.Earth' },
            { name: 'Universe.MilkyWay.SolarSystem.Mars' },
            { name: 'Universe.MilkyWay.AlphaCentauri.ProximaCentauri' },
            { name: 'Universe.MilkyWay.AlphaCentauri.RigilKentaurus' }
        ];

        var result = service.group(endpoints, 3);

        expect(result).toEqual([
            {
                group: "Universe.MilkyWay.SolarSystem",
                endpoints: [
                    { shortName: "Earth", endpoint: endpoints[0], groupName: "Universe.MilkyWay.SolarSystem" },
                    { shortName: "Mars", endpoint: endpoints[1], groupName: "Universe.MilkyWay.SolarSystem" }
                ]
            }, {
                group: "Universe.MilkyWay.AlphaCentauri",
                endpoints: [
                    { shortName: "ProximaCentauri", endpoint: endpoints[2], groupName: "Universe.MilkyWay.AlphaCentauri" },
                    { shortName: "RigilKentaurus", endpoint: endpoints[3], groupName: "Universe.MilkyWay.AlphaCentauri" }
                ]
            }
        ]);
    });

    it("creates smaller groups if endpoint name is to short", function() {
        var endpoints = [
            { name: 'Universe.MilkyWay.SolarSystem.Earth' },
            { name: 'Universe.MilkyWay.Voyager1' },
            { name: 'Universe.MilkyWay.Voyager2' }
        ];

        var result = service.group(endpoints, 3);

        expect(result).toEqual([
            {
                group: "Universe.MilkyWay.SolarSystem",
                endpoints: [
                    { shortName: "Earth", endpoint: endpoints[0], groupName: "Universe.MilkyWay.SolarSystem" }
                ]
            }, {
                group: "Universe.MilkyWay",
                endpoints: [
                    { shortName: "Voyager1", endpoint: endpoints[1], groupName: "Universe.MilkyWay" },
                    { shortName: "Voyager2", endpoint: endpoints[2], groupName: "Universe.MilkyWay" }
                ]
            }
        ]);
    });

    it("groups all endpoints that do not have any segments", function() {
        var endpoints = [
            { name: 'Universe.MilkyWay.SolarSystem.Earth' },
            { name: 'Space' },
            { name: 'Time' }
        ];

        var result = service.group(endpoints, 3);

        expect(result).toEqual([
            {
                group: "Universe.MilkyWay.SolarSystem",
                endpoints: [
                    { shortName: "Earth", endpoint: endpoints[0], groupName: "Universe.MilkyWay.SolarSystem" }
                ]
            }, {
                group: "Ungrouped",
                endpoints: [
                    { shortName: "Space", endpoint: endpoints[1], groupName: "Ungrouped" },
                    { shortName: "Time", endpoint: endpoints[2], groupName: "Ungrouped" }
                ]
            }
        ]);
    });
    
});