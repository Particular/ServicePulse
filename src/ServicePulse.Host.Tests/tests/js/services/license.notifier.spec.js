describe('licenseNotifierService', function () {
    beforeEach(module('licenseNotifierService', 'toastService'));

    var licenseNotifierService, toastService;

    beforeEach(inject( (_licenseNotifierService_, _toastService_) => {
        licenseNotifierService = _licenseNotifierService_;
        toastService = _toastService_;
    }));

    it('should warn of expiring trial', () => {
        toastSpy = spyOn(toastService, 'showWarning');
        licenseNotifierService.warnOfLicenseProblem('ValidWithExpiringTrial');
        expect(toastSpy).toHaveBeenCalled();
        var template = toastSpy.calls.argsFor(0);
        expect(template[0]).toContain("Your trial will expire soon");
    });

    it('should warn of expiring subscription', () => {
        toastSpy = spyOn(toastService, 'showWarning');
        licenseNotifierService.warnOfLicenseProblem('ValidWithExpiringSubscription');
        expect(toastSpy).toHaveBeenCalled();
        var template = toastSpy.calls.argsFor(0);
        expect(template[0]).toContain("Platform license expiring");
    });

    it('should warn of expiring upgrade protection', () => {
        toastSpy = spyOn(toastService, 'showWarning');
        licenseNotifierService.warnOfLicenseProblem('ValidWithExpiringUpgradeProtection');
        expect(toastSpy).toHaveBeenCalled();
        var template = toastSpy.calls.argsFor(0);
        expect(template[0]).toContain("Upgrade protection expiring");
    });

    it('should warn of expired upgrade protection', () => {
        toastSpy = spyOn(toastService, 'showWarning');
        licenseNotifierService.warnOfLicenseProblem('ValidWithExpiredUpgradeProtection');
        expect(toastSpy).toHaveBeenCalled();
        var template = toastSpy.calls.argsFor(0);
        expect(template[0]).toContain("Upgrade protection expired");
    });

    it('should do nothing if license not expiring', () => {
        toastSpy = spyOn(toastService, 'showWarning');
        licenseNotifierService.warnOfLicenseProblem('Valid');
        expect(toastSpy).not.toHaveBeenCalled();
        licenseNotifierService.warnOfLicenseProblem('InvalidDueToExpiredSubscription');
        expect(toastSpy).not.toHaveBeenCalled();
        licenseNotifierService.warnOfLicenseProblem('InvalidDueToExpiredTrial');
        expect(toastSpy).not.toHaveBeenCalled();
        licenseNotifierService.warnOfLicenseProblem('Moo License');
        expect(toastSpy).not.toHaveBeenCalled();
    });

});