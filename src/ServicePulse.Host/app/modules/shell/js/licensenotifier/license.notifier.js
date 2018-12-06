require('angular');

class LicenseNotifierService {
    constructor(toastService) {

    }


}

LicenseNotifierService.$inject = ['toastService'];

angular.module('licenseNotifierService', [])
    .service('licenseNotifierService', LicenseNotifierService);