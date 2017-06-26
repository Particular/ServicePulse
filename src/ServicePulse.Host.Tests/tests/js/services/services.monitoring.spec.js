describe('monitoringService', function () {
    beforeEach(module('services.monitoringService'));

    var monitoredEndpointWithData = {
        "NServiceBus.Endpoints": [
            {
                "Name": "Samples.Metrics.Tracing.Endpoint",
                "Data": { "Timestamps": [], "CriticalTime": [], "ProcessingTime": [] }
            }
        ]
    };

    var scEndpointWithMatchingData = [
        {
            "id": "48e7c05e-5cb6-703d-7862-2897cc2cfa01",
            "title": "Samples.Metrics.Tracing.Endpoint",
            "count": 2
        }
    ];

    var scEndpointWithMoreData = [{
            "id": "48e7c05e-5cb6-703d-7862-2897cc2cfa01",
            "title": "Samples.Metrics.Tracing.Endpoint",
            "count": 2
        },
        {
            "id": "48e7c05e-5cb6-703d-7862-2897cc2cfa02",
            "title": "Samples.Metrics.Tracing.Endpoint2",
            "count": 3
        }
    ];

    var monitoringService, $httpBackend;

    beforeEach(inject(function (_monitoringService_, _$httpBackend_) {
        monitoringService = _monitoringService_;
        $httpBackend = _$httpBackend_;
    }));

    it('should return unchanged collection when sc returns no matching rows', function () {
        $httpBackend.whenGET('http://localhost:1234/diagrams/data').respond(monitoredEndpointWithData);
        $httpBackend.whenGET('http://localhost:33333/api/recoverability/endpoints').respond([]);

        var monitoredEndpoints;
        monitoringService.getEndpoints().subscribe(function (response) {
            monitoredEndpoints = response;
            
            expect(monitoredEndpoints.Name).toEqual("Samples.Metrics.Tracing.Endpoint");
            expect(monitoredEndpoints.Count).not.toBeDefined();
            expect(monitoredEndpoints.Data.Timestamps).toEqual([]);
            expect(monitoredEndpoints.Data.CriticalTime).toEqual([]);
            expect(monitoredEndpoints.Data.ProcessingTime).toEqual([]);
        });
        $httpBackend.flush();
    });

    it('should return added collections when sc returns matching rows', function () {
        $httpBackend.whenGET('http://localhost:1234/diagrams/data').respond(monitoredEndpointWithData);
        $httpBackend.whenGET('http://localhost:33333/api/recoverability/endpoints').respond(scEndpointWithMatchingData);

        var monitoredEndpoints;
        monitoringService.getEndpoints().subscribe(function (response) {
            monitoredEndpoints = response;
            if (monitoredEndpoints.IsFromSC) {
                expect(monitoredEndpoints.Name).toEqual("Samples.Metrics.Tracing.Endpoint");
                expect(monitoredEndpoints.Count).toEqual(2);
            } else {
                expect(monitoredEndpoints.Name).toEqual("Samples.Metrics.Tracing.Endpoint");
                expect(monitoredEndpoints.Count).not.toBeDefined();
                expect(monitoredEndpoints.Data.Timestamps).toEqual([]);
                expect(monitoredEndpoints.Data.CriticalTime).toEqual([]);
                expect(monitoredEndpoints.Data.ProcessingTime).toEqual([]);
            }
        });
        $httpBackend.flush();
    });

    it('should return added collection when sc returns more rows',
        function() {
            $httpBackend.whenGET('http://localhost:1234/diagrams/data').respond(monitoredEndpointWithData);
            $httpBackend.whenGET('http://localhost:33333/api/recoverability/endpoints').respond(scEndpointWithMoreData);

            var monitoredEndpoints = [];
            monitoringService.getEndpoints().subscribe(function(response) {
                monitoredEndpoints.push(response);
                if (monitoredEndpoints.length === 2) {
                    expect(monitoredEndpoints[0].Name).toEqual("Samples.Metrics.Tracing.Endpoint");
                    expect(monitoredEndpoints[0].Count).toEqual(2);

                    expect(monitoredEndpoints[1].Name).toEqual("Samples.Metrics.Tracing.Endpoint2");
                    expect(monitoredEndpoints[1].Count).toEqual(3);
                }
            });
            $httpBackend.flush();
        });
});