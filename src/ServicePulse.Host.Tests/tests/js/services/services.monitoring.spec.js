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

    beforeEach(inject(function (_monitoringService_, _$httpBackend_) {
        monitoringService = _monitoringService_;
        $httpBackend = _$httpBackend_;
        scConfig = window.defaultConfig;
    }));

    it('should push endpoints retrieved from monitoring server', function (done) {
        window.defaultConfig.monitoring_urls = ['http://localhost:33633/'];

        $httpBackend.whenGET('http://localhost:33633/monitored-endpoints?history=5').respond(monitoredEndpointWithData);

        var monitoredEndpoints = [];
        var subscription = monitoringService.createEndpointsSource(5).subscribe(function (response) {
            monitoredEndpoints.push(response);

            if (monitoredEndpoints.length === 2) {
                expect(monitoredEndpoints[0].name).toEqual("Samples.Metrics.Tracing.Endpoint1");
                expect(monitoredEndpoints[0].data.timestamps).toEqual([]);
                expect(monitoredEndpoints[0].data.criticalTime).toEqual([]);
                expect(monitoredEndpoints[0].data.processingTime).toEqual([]);
                expect(monitoredEndpoints[1].name).toEqual("Samples.Metrics.Tracing.Endpoint2");
                expect(monitoredEndpoints[1].data.timestamps).toEqual([]);
                expect(monitoredEndpoints[1].data.criticalTime).toEqual([]);
                expect(monitoredEndpoints[1].data.processingTime).toEqual([]);

                subscription.dispose();
                done();
            }
        });

        setTimeout(function () {
            $httpBackend.flush();
        }, 0);
    });
});