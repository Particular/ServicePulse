describe('failedMessageGroupsController',
    function() {
        beforeEach(module('sc'));

        var $controller;

        beforeEach(inject(function(_$controller_) {
            $controller = _$controller_;
        }));

        describe('mark group as being processed',
            function() {
                var controller, serviceControlService, root, notifyService;

                beforeEach(inject(function ($rootScope, notifyService, $q) {
                    root = $rootScope;
                    this.notifyService = notifyService;
                    serviceControlService = { getExceptionGroups: function () { } };
                    var deferred = $q.defer();
                    spyOn(serviceControlService, 'getExceptionGroups').and.callFake(function () {
                        return deferred.promise;
                    });

                    controller = $controller('failedMessageGroupsController',
                    {
                        $scope: root,
                        $timeout: null,
                        $interval: null,
                        $location: null,
                        sharedDataService: { getstats: function() { return { number_of_pending_retries: 0 }; } },
                        notifyService: notifyService,
                        serviceControlService: serviceControlService,
                        failedMessageGroupsService: null
                    });
                }));

                it('when an event is pubslished groups is marked as in progress',
                    function () {
                        
                        spyOn(root, '$broadcast');

                        controller.exceptionGroups = [
                            { id: 1, workflow_state: null }, { id: 2, workflow_state: null },
                            { id: 3, workflow_state: null }
                        ];

                        this.notifyService().notify("RetryOperationStarted", { request_id: 1, number_of_messages: 10 });

                        expect(controller.exceptionGroups[0].workflow_state.status).toEqual('in_progress');
                        expect(controller.exceptionGroups[0].workflow_state.total).toEqual(10);
                        expect(controller.exceptionGroups[1].workflow_state).toEqual(null);
                        expect(controller.exceptionGroups[2].workflow_state).toEqual(null);
                    });

            });

        describe('report groups progress',
            function () {
                var controller, serviceControlService, root;

                beforeEach(inject(function ($rootScope, notifyService, $q) {
                    root = $rootScope;
                    this.notifyService = notifyService;
                    serviceControlService = { getExceptionGroups: function () { } };
                    var deferred = $q.defer();
                    spyOn(serviceControlService, 'getExceptionGroups').and.callFake(function () {
                        return deferred.promise;
                    });

                    controller = $controller('failedMessageGroupsController',
                    {
                        $scope: root,
                        $timeout: null,
                        $interval: null,
                        $location: null,
                        sharedDataService: { getstats: function () { return { number_of_pending_retries: 0 }; } },
                        notifyService: notifyService,
                        serviceControlService: serviceControlService,
                        failedMessageGroupsService: null
                    });
                }));

                it('when an event is pubslished group get its state updated',
                    function () {

                        spyOn(root, '$broadcast');

                        controller.exceptionGroups = [
                            { id: 1, workflow_state: {state: "in_progress", total:10} }, { id: 2, workflow_state: null },
                            { id: 3, workflow_state: null }
                        ];

                        this.notifyService().notify("RetryMessagesForwarded", { request_id: 1, number_of_messages_forwarded: 3 });

                        expect(controller.exceptionGroups[0].workflow_state.status).toEqual('in_progress');
                        expect(controller.exceptionGroups[0].workflow_state.total).toEqual(10);
                        expect(controller.exceptionGroups[0].workflow_state.count).toEqual(3);
                        expect(controller.exceptionGroups[1].workflow_state).toEqual(null);
                        expect(controller.exceptionGroups[2].workflow_state).toEqual(null);
                    });

            });

        describe('report groups processing finished',
            function () {
                var controller, serviceControlService, root;

                beforeEach(inject(function ($rootScope, notifyService, $q) {
                    root = $rootScope;
                    this.notifyService = notifyService;
                    serviceControlService = { getExceptionGroups: function () { } };
                    var deferred = $q.defer();
                    spyOn(serviceControlService, 'getExceptionGroups').and.callFake(function () {
                        return deferred.promise;
                    });

                    controller = $controller('failedMessageGroupsController',
                    {
                        $scope: root,
                        $timeout: null,
                        $interval: null,
                        $location: null,
                        sharedDataService: { getstats: function () { return { number_of_pending_retries: 0 }; } },
                        notifyService: notifyService,
                        serviceControlService: serviceControlService,
                        failedMessageGroupsService: null
                    });
                }));

                it('when an event is pubslished group get its state updated',
                    function () {

                        spyOn(root, '$broadcast');

                        controller.exceptionGroups = [
                            { id: 1, workflow_state: { state: "in_progress", total: 10, count: 3 } }, { id: 2, workflow_state: null },
                            { id: 3, workflow_state: null }
                        ];

                        this.notifyService().notify("RetryOperationCompleted", { request_id: 1});

                        expect(controller.exceptionGroups[0].workflow_state.status).toEqual('done');
                        expect(controller.exceptionGroups[1].workflow_state).toEqual(null);
                        expect(controller.exceptionGroups[2].workflow_state).toEqual(null);
                    });

            });
    });