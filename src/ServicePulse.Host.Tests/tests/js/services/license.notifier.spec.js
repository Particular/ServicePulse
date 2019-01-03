describe('licenseNotifierService', function () {
    beforeEach(module('licenseNotifierService', 'toastService'));

    var licenseNotifierService, toastService;

    beforeEach(inject(function (_licenseNotifierService_, _toastService_) {
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

describe('licenseController', function () {
    beforeEach(function () {
        module('ngRoute');
        module('sc');
        module('configuration.license');
    });

    var licenseController, formatter, licenseService, notifyService;

    beforeEach(inject(function (_$controller_, _formatter_, _licenseService_, _notifyService_, $rootScope) {
        licenseController = _$controller_('LicenseController', { $scope: $rootScope });
        formatter = _formatter_;
        licenseService = _licenseService_;
        notifyService = _notifyService_;
    }));

    it('should do something', function() {
//        spyOn(formatter, 'getDiffFromToday').and.callFake(() => {
//            return 1;
//        });
        var result = licenseController.getUpgradeDaysLeft(null, true);
//        expect(result).toEqual("moo");  
    });

});