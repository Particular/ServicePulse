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
        monitoringService.getEndpoints().then(function (response) {
            monitoredEndpoints = response.data;
        });
        $httpBackend.flush();

        expect(monitoredEndpoints["NServiceBus.Endpoints"].length).toEqual(1);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Name).toEqual("Samples.Metrics.Tracing.Endpoint");
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Errors).not.toBeDefined();
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Data.Timestamps).toEqual([]);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Data.CriticalTime).toEqual([]);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Data.ProcessingTime).toEqual([]);
    });

    it('should return filled collection when sc returns matching rows', function () {
        $httpBackend.whenGET('http://localhost:1234/diagrams/data').respond(monitoredEndpointWithData);
        $httpBackend.whenGET('http://localhost:33333/api/recoverability/endpoints').respond(scEndpointWithMatchingData);

        var monitoredEndpoints;
        monitoringService.getEndpoints().then(function (response) {
            monitoredEndpoints = response.data;
        });
        $httpBackend.flush();

        expect(monitoredEndpoints["NServiceBus.Endpoints"].length).toEqual(1);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Name).toEqual("Samples.Metrics.Tracing.Endpoint");
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Errors).toEqual(2);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Data.Timestamps).toEqual([]);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Data.CriticalTime).toEqual([]);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Data.ProcessingTime).toEqual([]);
    });

    it('should return bigger collection when sc returns more rows', function () {
        $httpBackend.whenGET('http://localhost:1234/diagrams/data').respond(monitoredEndpointWithData);
        $httpBackend.whenGET('http://localhost:33333/api/recoverability/endpoints').respond(scEndpointWithMoreData);

        var monitoredEndpoints;
        monitoringService.getEndpoints().then(function (response) {
            monitoredEndpoints = response.data;
        });
        $httpBackend.flush();

        expect(monitoredEndpoints["NServiceBus.Endpoints"].length).toEqual(2);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Name).toEqual("Samples.Metrics.Tracing.Endpoint");
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Errors).toEqual(2);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Data.Timestamps).toEqual([]);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Data.CriticalTime).toEqual([]);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][0].Data.ProcessingTime).toEqual([]);

        expect(monitoredEndpoints["NServiceBus.Endpoints"][1].Name).toEqual("Samples.Metrics.Tracing.Endpoint2");
        expect(monitoredEndpoints["NServiceBus.Endpoints"][1].Errors).toEqual(3);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][1].Data.Timestamps).toEqual([]);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][1].Data.CriticalTime).toEqual([]);
        expect(monitoredEndpoints["NServiceBus.Endpoints"][1].Data.ProcessingTime).toEqual([]);
    });
});