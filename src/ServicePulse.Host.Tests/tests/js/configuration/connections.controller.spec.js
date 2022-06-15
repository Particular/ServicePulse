/// <reference path="../_references.js" />

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