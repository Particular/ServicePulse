describe('prettifyService', function () {
    beforeEach(module('sc'));

    var jsonObject =
    {
        "name": "Samples.Metrics.Tracing.Endpoint1",
        "data": {
            "timestamps": [],
            "criticalTime": [],
            "processingTime": []
        }
    };

    var jsonString = '{ "name": "Samples.Metrics.Tracing.Endpoint1", "data": { "timestamps": [], "criticalTime": [], "processingTime": []}}';

    var xmlString = '<xml><name>Samples.Metrics.Tracing.Endpoint1</name><data><timestamps></timestamps></data></xml>';

    var prettifyService;

    beforeEach(inject(function (_prettifyService_) {
        prettifyService = _prettifyService_;
        
        
    }));

    it('should prettify json object', inject(function(prettifyService)
    {
        var result = prettifyService.prettifyText(jsonObject);
        expect(typeof result).toBe('string');
        expect(result).toContain('Samples.Metrics.Tracing.Endpoint1');
    }));

    it('should prettify json string', inject(function (prettifyService) {
        var result = prettifyService.prettifyText(jsonString);
        expect(typeof result).toBe('string');
        expect(result).not.toBe(jsonString);
        expect(result).toContain('Samples.Metrics.Tracing.Endpoint1');
    }));

    // At the moment I don't know how to force test project to inject proper JQuery into angular. As we switched to webpack and it's way to register it we probably would have to use webpack for tests as well.
    //it('should prettify xml string', inject(function (prettifyService) {
    //    var result = prettifyService.prettifyText(xmlString);
    //    expect(typeof result).toBe('string');
    //    expect(result).not.toBe(xmlString);
    //    expect(result).toContain('Samples.Metrics.Tracing.Endpoint1');
    //}));


    it('should ignore data of any other type and simply return it', inject(function (prettifyService) {
        var date = new Date();
        var result = prettifyService.prettifyText(date);
        expect(result).toBe(date);
    }));

});