/// <reference path="../_references.js" />

describe("Unit: Configuration Data Service ", function () {
    beforeEach(module('sc'));

    it('should contain a configurationService',
          inject(function (configurationService) {
              expect(typeof (configurationService) == typeof (undefined)).toEqual(false);;
          }));
});