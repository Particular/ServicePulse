;
(function (window, angular, undefined) {
    "use strict";
    
    function controller(
        $scope,
        $timeout,
        $interval,
        $location,
        $uibModal,
        sharedDataService,
        notifyService,
        serviceControlService,
        redirectService) {

        var vm = this;
        var notifier = notifyService();
       
        vm.loadingData = false;
        vm.redirects = [
            {
                "id": "f007f5e3-5d5f-43ed-951e-50a9a2d8e8e6",
                "sourceEndpoint": "queueNameA",
                "targetEndpoint": "queueNameB",
                "createdDate": "2016-03-24T15:53:51.784249Z",
                "lastUsed": "",
                "currentErrorCount":2
            }, {
                "id": "f007f5e3-5d5f-43ed-951e-50a9a2d8e8e7",
                "sourceEndpoint": "queueNameC",
                "targetEndpoint": "queueNameD",
                "createdDate": "2016-04-24T15:53:51.784249Z",
                "lastUsed": "",
                "currentErrorCount":3
            }, {
                "id": "f007f5e3-5d5f-43ed-951e-50a9a2d8e8e8",
                "sourceEndpoint": "queueNameE",
                "targetEndpoint": "queueNameF",
                "createdDate": "2016-05-24T15:53:51.784249Z",
                "lastUsed": "",
                "currentErrorCount":4
            }
        ];

        vm.createRedirect = function () {
            $uibModal.open({
                templateUrl: 'js/views/redirect/edit/view.html',
                controller: 'editRedirectController',
                resolve: {
                    redirect: undefined
                }
            }).result.then(function (selectedItem) {
                //refresh data
            });
            //redirectService.createRedirect(sourceEndpoint, targetEndpoint, success, error);
        };

        vm.editRedirect = function (redirect) {
            $uibModal.open({
                templateUrl: 'js/views/redirect/edit/view.html',
                controller: 'editRedirectController',
                resolve: {
                    redirect : function() {
                        return redirect;
                    }
                }
            }).result.then(function (selectedItem) {
                //refresh data
            });
        };

        vm.deleteRedirect = function (id, success, error) {
            redirectService.deleteRedirect(id, success, error);
        };
    }

    controller.$inject = [
        "$scope",
        "$timeout",
        "$interval",
        "$location",
        "$uibModal",
        "sharedDataService",
        "notifyService",
        "serviceControlService",
        "redirectService"
    ];

    angular.module("sc")
        .controller("redirectController", controller);

})(window, window.angular);