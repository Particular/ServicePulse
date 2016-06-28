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
            },
            {
                "id": "f007f5e3-5d5f-43ed-951e-50a9a2d8e8e1",
                "sourceEndpoint": "queueNameG",
                "targetEndpoint": "queueNameB",
                "createdDate": "2016-03-24T15:53:51.784249Z",
                "lastUsed": "",
                "currentErrorCount": 2
            }, {
                "id": "f007f5e3-5d5f-43ed-951e-50a9a2d8e8e2",
                "sourceEndpoint": "queueNameI",
                "targetEndpoint": "queueNameD",
                "createdDate": "2016-04-24T15:53:51.784249Z",
                "lastUsed": "",
                "currentErrorCount": 3
            }, {
                "id": "f007f5e3-5d5f-43ed-951e-50a9a2d8e8e3",
                "sourceEndpoint": "queueNameJ",
                "targetEndpoint": "queueNameF",
                "createdDate": "2016-05-24T15:53:51.784249Z",
                "lastUsed": "",
                "currentErrorCount": 4
            },
            {
                "id": "f007f5e3-5d5f-43ed-951e-50a9a2d8e8e4",
                "sourceEndpoint": "queueNameK",
                "targetEndpoint": "queueNameB",
                "createdDate": "2016-03-24T15:53:51.784249Z",
                "lastUsed": "",
                "currentErrorCount": 2
            }, {
                "id": "f007f5e3-5d5f-43ed-951e-50a9a2d8e817",
                "sourceEndpoint": "queueNameL",
                "targetEndpoint": "queueNameD",
                "createdDate": "2016-04-24T15:53:51.784249Z",
                "lastUsed": "",
                "currentErrorCount": 3
            }, {
                "id": "f007f5e3-5d5f-43ed-951e-50a9a2d8e828",
                "sourceEndpoint": "queueNameM",
                "targetEndpoint": "queueNameF",
                "createdDate": "2016-05-24T15:53:51.784249Z",
                "lastUsed": "",
                "currentErrorCount": 4
            },
            {
                "id": "f007f5e3-5d5f-43ed-951e-50a9a2d8e836",
                "sourceEndpoint": "queueNameN",
                "targetEndpoint": "queueNameB",
                "createdDate": "2016-03-24T15:53:51.784249Z",
                "lastUsed": "",
                "currentErrorCount": 2
            }, {
                "id": "f007f5e3-5d5f-43ed-951e-50a9a2d8e847",
                "sourceEndpoint": "queueNameO",
                "targetEndpoint": "queueNameD",
                "createdDate": "2016-04-24T15:53:51.784249Z",
                "lastUsed": "",
                "currentErrorCount": 3
            }, {
                "id": "f007f5e3-5d5f-43ed-951e-50a9a2d8e858",
                "sourceEndpoint": "queueNameP",
                "targetEndpoint": "queueNameF",
                "createdDate": "2016-05-24T15:53:51.784249Z",
                "lastUsed": "",
                "currentErrorCount": 4
            }
        ];

        function refreshData() {
            redirectService.getRedirects().then(function(result) {
                vm.redirects = result.data;
            });
        }

        vm.createRedirect = function () {
            $uibModal.open({
                templateUrl: 'js/views/redirect/edit/view.html',
                controller: 'editRedirectController',
                resolve: {
                    data: function() {
                        return {
                            redirect: undefined,
                            title: "Create Redirect"
                        };
                    }
                }
            }).result.then(function (selectedItem) {
                refreshData();
            });
        };

        vm.editRedirect = function (redirect) {
            $uibModal.open({
                templateUrl: 'js/views/redirect/edit/view.html',
                controller: 'editRedirectController',
                resolve: {
                    data : function() {
                        return {
                            redirect: redirect,
                            title: "Modify Redirect"
                        };
                    }
                }
            }).result.then(function (selectedItem) {
                refreshData();
            });
        };

        vm.deleteRedirect = function (id, success, error) {
            redirectService.deleteRedirect(id, success, error);
            refreshData();
        };
        refreshData();
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