/// <reference path="../_references.js" />

//System Under Test (TODO:To be extracted)
var ServiceControlTestUrl = {
    parse: ({ browserCurrentUrl, urlToParse: urlToParse, monitoring = false }) => {
        return undefined;
    }
};

describe("ServiceControl Test URL generator", function() {
    it('Parses URL and returns the URL that should be used to test the SC instance or SC Monitoring instance', function(){
        var {browserCurrentUrl="http://localhost:9090/#/configuration/connections";
        //INVALID URIs
        expect(ServiceControlTestUrl.parse({browserCurrentUrl, urlToParse: "http:localhost"})).toEqual(undefined); 
        expect(ServiceControlTestUrl.parse({browserCurrentUrl, urlToParse:"https:/localhost"})).toEqual(undefined); 
        
        //SAMPLES FOR non-MONITORING:
        expect(ServiceControlTestUrl.parse({browserCurrentUrl, urlToParse: "http://localhost/api"})).toEqual("http://localhost/api");
        //without passing protocol defaults to http
        expect(ServiceControlTestUrl.parse({browserCurrentUrl, urlToParse:"localhost"})).toEqual("http://localhost");
        //with protocol, preserves protocol
        expect(ServiceControlTestUrl.parse({browserCurrentUrl, urlToParse:"https://localhost/api"})).toEqual("https://localhost/api");
        //works with trailing /
        expect(ServiceControlTestUrl.parse({browserCurrentUrl, urlToParse:"https://localhost/api/"})).toEqual("https://localhost/api");
        //without host, uses current url host preserving protocol and port
        expect(ServiceControlTestUrl.parse({browserCurrentUrl, urlToParse:"/api/"})).toEqual("https://localhost:9090/api");
        
        //SAMPLES FOR MONITORING:
        //Valid URI for monitoring instance returns passed URL plus CORS path
        expect(ServiceControlTestUrl.parse({browserCurrentUrl, urlToParse:"http://localhost",monitoring: true})).toEqual("http://localhost/monitored-endpoints");
        //without passing protocol defaults to http
        expect(ServiceControlTestUrl.parse({browserCurrentUrl, urlToParse:"localhost", monitoring: true})).toEqual("http://localhost/monitored-endpoints");
        //with protocol, preserves protocol
        expect(ServiceControlTestUrl.parse({browserCurrentUrl, urlToParse:"https://localhost", monitoring: true})).toEqual("https://localhost/monitored-endpoints");
        //works with trailing /
        expect(ServiceControlTestUrl.parse({browserCurrentUrl, urlToParse:"https://localhost/", monitoring: true})).toEqual("https://localhost/monitored-endpoint");
        //without host, uses current url host as base path preserving protocol and port
        expect(ServiceControlTestUrl.parse({browserCurrentUrl, urlToParse:"/", monitoring: true})).toEqual("https://localhost:9090/monitored-endpoint");
    })
});

describe("Unit: Connection Controller -  ", function () {
    beforeEach(module('sc'));

    var $controller;

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));
    
    var controller, url;
    var connectionManagerProxy = { getServiceControlUrl: function (){return url;}, getMonitoringUrl: function(){return "";}, getIsMonitoringEnabled: function(){return false;}};    
    
    it('When providing a ServiceControl url http://localhost, we make a http get to that url',
        function() {        
            // Value entered by the user: http://localhost            
            // then the url to which we are making a call should be: http://localhost 
            url = "http://localhost";
            
            controller = $controller('connectionsController', {
                $scope: {},
                connectionsManager: connectionManagerProxy,
                notifyService: function () { return { subscribe: function () { } } }
            });
            controller.testServiceControlUrl();

            expect(controller.configuredServiceControlUrl).toEqual(url);        
    });

    it('When providing a ServiceControl url https://localhost, we make a http get to that url',
        function() {
            // Value entered by the user: https://localhost            
            // then the url to which we are making a call should be: https://localhost 
            url = "https://localhost";

            controller = $controller('connectionsController', {
                $scope: {},
                connectionsManager: connectionManagerProxy,
                notifyService: function () { return { subscribe: function () { } } }
            });
            controller.testServiceControlUrl();

            expect(controller.configuredServiceControlUrl).toEqual(url);
        });

    it('When providing a ServiceControl url localhost and url in the browsers uses http, e make a http get to: http://localhost',         
        inject(function (configurationService) {
            // Value entered by the user: localhost
            // Current url in the browser: http://localhost:33333/
            // then the url to which we are making a call should be: http://localhost 
            url = "localhost";

            controller = $controller('connectionsController', {
                $scope: {},
                connectionsManager: connectionManagerProxy,
                notifyService: function () { return { subscribe: function () { } } }
            });
            controller.testServiceControlUrl();

            expect(controller.configuredServiceControlUrl).toEqual("http://localhost");
            
            // Value entered by the user: localhost
            // Current url in the browser: https://localhost:33333/
            // then the url to which we are making a call should be: https://localhost
            
        }));

    it('When providing a ServiceControl url localhost and url in the browsers uses https, e make a http get to: https://localhost',
        inject(function (configurationService) {
            // Value entered by the user: localhost
            // Current url in the browser: https://localhost:33333/
            // then the url to which we are making a call should be: https://localhost
            url = "localhost";

            controller = $controller('connectionsController', {
                $scope: {},
                connectionsManager: connectionManagerProxy,
                notifyService: function () { return { subscribe: function () { } } }
            });
            controller.testServiceControlUrl();

            expect(controller.configuredServiceControlUrl).toEqual("https://localhost");

            

        }));

    it('When providing a ServiceControl url without a host like /api and url in the browser is http://localhost, we make a call to http://localhost/api',
        inject(function (configurationService) {
            // Value entered by the user: /api
            // Current url in the browser: http://localhost:33333/
            // then the url to which we are making a call should be: http://localhost:33333/api 

            // Value entered by the user: /api
            // Current url in the browser: https://localhost:33333/
            // then the url to which we are making a call should be: https://localhost:33333/api
        }));
});