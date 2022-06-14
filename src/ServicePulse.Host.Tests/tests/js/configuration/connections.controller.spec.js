/// <reference path="../_references.js" />

describe("Unit: Connection Controller -  ", function () {
    beforeEach(module('sc'));

    it('When providing a ServiceControl url with a host indlucing protocol, we make a http get to that url',
        inject(function (configurationService) {
            // Value entered by the user: http://localhost            
            // then the url to which we are making a call should be: http://localhost 

            // Value entered by the user: https://localhost            
            // then the url to which we are making a call should be: https://localhost
        }));

    it('When providing a ServiceControl url with a host without including the protocol, ...',         
        inject(function (configurationService) {
            // Value entered by the user: localhost
            // Current url in the browser: http://localhost:33333/
            // then the url to which we are making a call should be: http://localhost 

            // Value entered by the user: localhost
            // Current url in the browser: https://localhost:33333/
            // then the url to which we are making a call should be: https://localhost
            
        }));

    it('When providing a ServiceControl url without a host, ...',
        inject(function (configurationService) {
            // Value entered by the user: /api
            // Current url in the browser: http://localhost:33333/
            // then the url to which we are making a call should be: http://localhost:33333/api 

            // Value entered by the user: /api
            // Current url in the browser: https://localhost:33333/
            // then the url to which we are making a call should be: https://localhost:33333/api
        }));
});