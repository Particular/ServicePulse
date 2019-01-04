describe('licenseNotifierService', function () {
    beforeEach(module('licenseNotifierService', 'toastService'));

    var licenseNotifierService, toastService;

    beforeEach(inject( (_licenseNotifierService_, _toastService_) => {
        licenseNotifierService = _licenseNotifierService_;
        toastService = _toastService_;
    }));

    it('should warn of expiring trial', function () {
        toastSpy = spyOn(toastService, 'showWarning');
        licenseNotifierService.warnOfLicenseProblem('ValidWithExpiringTrial');
        expect(toastSpy).toHaveBeenCalled();
        var template = toastSpy.calls.argsFor(0);
        expect(template[0]).toContain("Your trial will expire soon");

    });

});