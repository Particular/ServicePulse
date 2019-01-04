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
                    serviceControlService = { getExceptionGroups: function () { }, getHistoricGroups: function () { }, getExceptionGroupClassifiers: function() {} };
                    var deferred = $q.defer();
                    spyOn(serviceControlService, 'getExceptionGroups').and.callFake(function () {
                        return deferred.promise;
                    });
                    spyOn(serviceControlService, 'getHistoricGroups').and.callFake(function () {
                        return deferred.promise;
                    });

                    spyOn(serviceControlService, 'getExceptionGroupClassifiers').and.callFake(function () {
                        return deferred.promise;
                    });

                    controller = $controller('failedMessageGroupsController',
                    {
                        $scope: root,
                        $timeout: null,
                        $interval: function(){},
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

                        this.notifyService()
                            .notify("RetryOperationWaiting",
                            {
                                request_id: 1,
                                progress: {
                                    percentage: 0.3,
                                    messages_remaining: 2
                                }
                            });

                        expect(controller.exceptionGroups[0].workflow_state.status).toEqual('waiting');
                        expect(controller.exceptionGroups[0].workflow_state.total).toEqual(30);
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
                    serviceControlService = { getExceptionGroups: function () { }, getHistoricGroups: function () { }, getExceptionGroupClassifiers: function () { } };
                    var deferred = $q.defer();
                    spyOn(serviceControlService, 'getExceptionGroups').and.callFake(function () {
                        return deferred.promise;
                    });
                    spyOn(serviceControlService, 'getHistoricGroups').and.callFake(function () {
                        return deferred.promise;
                    });

                    spyOn(serviceControlService, 'getExceptionGroupClassifiers').and.callFake(function () {
                        return deferred.promise;
                    });

                    controller = $controller('failedMessageGroupsController',
                    {
                        $scope: root,
                        $timeout: null,
                        $interval: function () { },
                        $location: null,
                        sharedDataService: { getstats: function () { return { number_of_pending_retries: 0 }; } },
                        notifyService: notifyService,
                        serviceControlService: serviceControlService,
                        failedMessageGroupsService: null
                    });
                }));

                it('when an event RetryOperationForwarding is pubslished group get its state updated',
                    function () {

                        spyOn(root, '$broadcast');

                        controller.exceptionGroups = [
                            { id: 1, workflow_state: {state: "in_progress", total:10} }, { id: 2, workflow_state: null },
                            { id: 3, workflow_state: null }
                        ];

                        this.notifyService().notify("RetryOperationForwarding", {
                            request_id: 1, progress: {
                                percentage: 0.6,
                                messages_remaining: 2
                            }
                        });

                        expect(controller.exceptionGroups[0].workflow_state.status).toEqual('forwarding');
                        expect(controller.exceptionGroups[0].workflow_state.total).toEqual(60);
                        expect(controller.exceptionGroups[1].workflow_state).toEqual(null);
                        expect(controller.exceptionGroups[2].workflow_state).toEqual(null);
                    });

                it('when an event RetryOperationForwarded is pubslished group get its state updated',
                    function () {

                        spyOn(root, '$broadcast');

                        controller.exceptionGroups = [
                            { id: 1, workflow_state: { state: "in_progress", total: 10 } }, { id: 2, workflow_state: null },
                            { id: 3, workflow_state: null }
                        ];

                        this.notifyService().notify("RetryOperationForwarded", {
                            request_id: 1, progress: {
                                percentage: 0.7,
                                messages_remaining: 2
                            }
                        });

                        expect(controller.exceptionGroups[0].workflow_state.status).toEqual('forwarding');
                        expect(controller.exceptionGroups[0].workflow_state.total).toEqual(70);
                        expect(controller.exceptionGroups[1].workflow_state).toEqual(null);
                        expect(controller.exceptionGroups[2].workflow_state).toEqual(null);
                    });


                it('when an event RetryOperationPreparing is pubslished group get its state updated',
                    function () {

                        spyOn(root, '$broadcast');

                        controller.exceptionGroups = [
                            { id: 1, workflow_state: { state: "in_progress", total: 10 } }, { id: 2, workflow_state: null },
                            { id: 3, workflow_state: null }
                        ];

                        this.notifyService().notify("RetryOperationPreparing", {
                            request_id: 1, progress: {
                                percentage: 0.5,
                                messages_remaining: 2
                            }
                        });

                        expect(controller.exceptionGroups[0].workflow_state.status).toEqual('preparing');
                        expect(controller.exceptionGroups[0].workflow_state.total).toEqual(50);
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
                    serviceControlService = { getExceptionGroups: function () { }, getHistoricGroups: function () { }, getExceptionGroupClassifiers: function () { } };
                    var deferred = $q.defer();
                    spyOn(serviceControlService, 'getExceptionGroups').and.callFake(function () {
                        return deferred.promise;
                    });
                    spyOn(serviceControlService, 'getHistoricGroups').and.callFake(function () {
                        return deferred.promise;
                    });

                    spyOn(serviceControlService, 'getExceptionGroupClassifiers').and.callFake(function () {
                        return deferred.promise;
                    });

                    controller = $controller('failedMessageGroupsController',
                    {
                        $scope: root,
                        $timeout: null,
                        $interval: function () { },
                        $location: null,
                        sharedDataService: { getstats: function () { return { number_of_pending_retries: 0 }; } },
                        notifyService: notifyService,
                        serviceControlService: serviceControlService,
                        failedMessageGroupsService: null
                    });
                }));

                it('when an event is published group get its state updated',
                    function () {

                        spyOn(root, '$broadcast');

                        controller.exceptionGroups = [
                            { id: 1, workflow_state: { state: "in_progress", total: 10, count: 3 } }, { id: 2, workflow_state: null },
                            { id: 3, workflow_state: null }
                        ];

                        this.notifyService().notify("RetryOperationCompleted", {
                            request_id: 1, progress: {
                                percentage: 1,
                                messages_remaining: 0
                            }
                        });

                        expect(controller.exceptionGroups[0].workflow_state.status).toEqual('completed');
                        expect(controller.exceptionGroups[1].workflow_state).toEqual(null);
                        expect(controller.exceptionGroups[2].workflow_state).toEqual(null);
                    });

            });

        describe('update exception groups',
            function () {
                var controller, serviceControlService, root, deferred;

                beforeEach(inject(function ($rootScope, notifyService, $q) {
                    root = $rootScope;
                    this.notifyService = notifyService;
                    serviceControlService = { getExceptionGroups: function () { }, getHistoricGroups: function () { }, getExceptionGroupClassifiers: function () { } };
                    deferred = $q.defer();
                    var emptyDefer = $q.defer();
                    spyOn(serviceControlService, 'getExceptionGroups').and.callFake(function () {
                        return deferred.promise;
                    });
                    spyOn(serviceControlService, 'getHistoricGroups').and.callFake(function () {
                        return emptyDefer.promise;
                    });

                    spyOn(serviceControlService, 'getExceptionGroupClassifiers').and.callFake(function () {
                        return emptyDefer.promise;
                    });

                    controller = $controller('failedMessageGroupsController',
                    {
                        $scope: root,
                        $timeout: null,
                        $interval: function () { },
                        $location: null,
                        sharedDataService: { getstats: function () { return { number_of_pending_retries: 0 }; } },
                        notifyService: notifyService,
                        serviceControlService: serviceControlService,
                        failedMessageGroupsService: null
                    });
                }));

                it('add new group to an empty set',
                    function () {
                        controller.exceptionGroups = [];

                        controller.updateExceptionGroups();
                        root.$apply(function () {
                            deferred.resolve({ data: [{ id: 3, workflow_state: null }] });
                        });
                        expect(controller.exceptionGroups[0].id).toEqual(3);
                        expect(controller.exceptionGroups[0].workflow_state).toBeDefined();
                        
                    });

                it('update a group',
                    function () {
                        controller.exceptionGroups = [{id: 3, workflow_state: null }];

                        controller.updateExceptionGroups();
                        root.$apply(function () {
                            deferred.resolve({ data: [{ id: 3, workflow_state: null, retry_status: 'pending' }] });
                        });
                        expect(controller.exceptionGroups[0].id).toEqual(3);
                        expect(controller.exceptionGroups[0].workflow_state).toBeDefined();
                        expect(controller.exceptionGroups[0].retry_status).toEqual('pending');

                    });

                it('delete a group',
                    function () {
                        controller.exceptionGroups = [{ id: 3, workflow_state: null }];

                        controller.updateExceptionGroups();
                        root.$apply(function () {
                            //deferred.resolve({data: []});
                            deferred.resolve({ data: [] });
                        });
                        expect(controller.exceptionGroups.length).toEqual(0);
                    });

                it('adds a group, delete and updates ',
                    function () {
                        controller.exceptionGroups = [{ id: 3, workflow_state: null }, {id: 4}];

                        controller.updateExceptionGroups();
                        root.$apply(function () {
                            deferred.resolve({
                                data: [{ id: 1, workflow_state: null, retry_status: 'forwarding' }, { id: 2, workflow_state: null, retry_status: 'completed' },
                                { id: 3, workflow_state: null, retry_status: 'pending' }]
                            });
                            deferred.resolve({ data: [] });
                        });
                        expect(controller.exceptionGroups.length).toEqual(3);
                        expect(controller.exceptionGroups[0].id).toEqual(3);
                        expect(controller.exceptionGroups[0].workflow_state).toBeDefined();
                        expect(controller.exceptionGroups[0].retry_status).toEqual('pending');
                        expect(controller.exceptionGroups[1].id).toEqual(1);
                        expect(controller.exceptionGroups[1].workflow_state).toBeDefined();
                        expect(controller.exceptionGroups[1].retry_status).toEqual('forwarding');
                        expect(controller.exceptionGroups[2].id).toEqual(2);
                        expect(controller.exceptionGroups[2].workflow_state).toBeDefined();
                        expect(controller.exceptionGroups[2].retry_status).toEqual('completed');
                    });
            });
    });