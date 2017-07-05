describe('monitoringService', function () {
    beforeEach(module('services.monitoringService'));

    var monitoredEndpointWithData = [
        {
            "name": "Samples.Metrics.Tracing.Endpoint1",
            "data": {
                "timestamps": [],
                "criticalTime": [],
                "processingTime": []
            }
        },
        {
            "name": "Samples.Metrics.Tracing.Endpoint2",
            "data": {
                "timestamps": [],
                "criticalTime": [],
                "processingTime": []
            }
        }
    ];

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
        expect(monitoredEndpoints[0].name).toEqual("Samples.Metrics.Tracing.Endpoint1");
        expect(monitoredEndpoints[0].data.timestamps).toEqual([]);
        expect(monitoredEndpoints[0].data.criticalTime).toEqual([]);
        expect(monitoredEndpoints[0].data.processingTime).toEqual([]);
        expect(monitoredEndpoints[1].name).toEqual("Samples.Metrics.Tracing.Endpoint2");
        expect(monitoredEndpoints[1].data.timestamps).toEqual([]);
        expect(monitoredEndpoints[1].data.criticalTime).toEqual([]);
        expect(monitoredEndpoints[1].data.processingTime).toEqual([]);
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