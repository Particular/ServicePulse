require('angular');

class LicenseNotifierService {
    constructor(toastService) {
        this.toastService = toastService;
    }

    checkLicense() {
        this.toastService.showWarning('License wararara', true);
    }
}

LicenseNotifierService.$inject = ['toastService'];

angular.module('licenseNotifierService', ['toaster'])
    .service('licenseNotifierService', LicenseNotifierService);