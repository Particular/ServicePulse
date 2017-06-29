describe('monitoringService', function () {
    beforeEach(module('services.monitoringService'));

    var monitoredEndpointWithData = {
        "NServiceBus.Endpoints": [
            {
                "Name": "Samples.Metrics.Tracing.Endpoint1",
                "Data": { "Timestamps": [], "CriticalTime": [], "ProcessingTime": [] }
            },
            {
                "Name": "Samples.Metrics.Tracing.Endpoint2",
                "Data": { "Timestamps": [], "CriticalTime": [], "ProcessingTime": [] }
            },
        ]
    };

    var monitoringService, $httpBackend, scConfig;

    beforeEach(inject(function (_monitoringService_, _$httpBackend_, _scConfig_) {
        monitoringService = _monitoringService_;
        $httpBackend = _$httpBackend_;
        scConfig = _scConfig_;
    }));

    it('should push endpoints retrieved from monitoring server', function () {
        scConfig.monitoring_urls = ['http://localhost:1234/diagrams'];

        $httpBackend.whenGET('http://localhost:1234/diagrams/data').respond(monitoredEndpointWithData);

        var monitoredEndpoints = [];
        monitoringService.endpoints.subscribe(function (response) {
            monitoredEndpoints.push(response);
        });
        $httpBackend.flush();

        expect(monitoredEndpoints.length).toEqual(2);
        expect(monitoredEndpoints[0].Name).toEqual("Samples.Metrics.Tracing.Endpoint1");
        expect(monitoredEndpoints[0].Data.Timestamps).toEqual([]);
        expect(monitoredEndpoints[0].Data.CriticalTime).toEqual([]);
        expect(monitoredEndpoints[0].Data.ProcessingTime).toEqual([]);
        expect(monitoredEndpoints[1].Name).toEqual("Samples.Metrics.Tracing.Endpoint2");
        expect(monitoredEndpoints[1].Data.Timestamps).toEqual([]);
        expect(monitoredEndpoints[1].Data.CriticalTime).toEqual([]);
        expect(monitoredEndpoints[1].Data.ProcessingTime).toEqual([]);
    });

    it('should push endpoints retrieved from multiple monitoring servers', function () {
        scConfig.monitoring_urls = ['http://localhost:1234/diagrams', 'http://localhost:5678/diagrams'];

        $httpBackend.whenGET('http://localhost:1234/diagrams/data').respond(monitoredEndpointWithData);
        $httpBackend.whenGET('http://localhost:5678/diagrams/data').respond(monitoredEndpointWithData);

        var monitoredEndpoints = [];
        monitoringService.endpoints.subscribe(function (response) {
            monitoredEndpoints.push(response);
        });
        $httpBackend.flush();

        expect(monitoredEndpoints.length).toEqual(4);
    });
});