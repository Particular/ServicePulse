describe('failedMessagesController',
    function() {
        beforeEach(module('sc'));

        var $controller;

        beforeEach(inject(function(_$controller_) {
            $controller = _$controller_;
        }));

        describe('when calling selectAllMessages',
            function() {
                var controller, serviceControlService, root, deferred, getFailedMessageSpy;

                beforeEach(inject(function ($rootScope, notifyService, $q) {
                    root = $rootScope;
                    this.notifyService = notifyService;
                    serviceControlService = { getExceptionGroups: function () { }, getFailedMessages: function(){ } };
                    deferred = $q.defer();
                    spyOn(serviceControlService, 'getExceptionGroups').and.callFake(function () {

                        return deferred.promise;
                    });

                    getFailedMessageSpy = spyOn(serviceControlService, 'getFailedMessages').and.callFake(function () {
                        return deferred.promise;
                    });

                    controller = $controller('failedMessagesController',
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

                it('all messages should be selected',
                    function () {

                        controller.failedMessages = [{id: 0, selected: false}, {id: 1, selected: false}, {id:2, selected: false}];

                        controller.selectAllMessages();

                        expect(controller.failedMessages[0].selected).toEqual(true);
                        expect(controller.failedMessages[1].selected).toEqual(true);
                        expect(controller.failedMessages[2].selected).toEqual(true);
                        expect(controller.selectedIds.length).toEqual(3);
                    });

                it('if any message was selected, all should be unselected',
                    function () {

                        controller.failedMessages = [{id: 0, selected: false}, {id: 1, selected: true}, {id:2, selected: false}];
                        controller.selectedIds = [1];

                        controller.selectAllMessages();

                        expect(controller.failedMessages[0].selected).toEqual(false);
                        expect(controller.failedMessages[1].selected).toEqual(false);
                        expect(controller.failedMessages[2].selected).toEqual(false);
                        expect(controller.selectedIds.length).toEqual(0);
                    });
            });

        describe('when loading the data with infinite scroll',
            function() {
                var controller, serviceControlService, root, deferred, getFailedMessageSpy;

                beforeEach(inject(function ($rootScope, notifyService, $q) {
                    root = $rootScope;
                    this.notifyService = notifyService;
                    serviceControlService = { getExceptionGroups: function () { }, getFailedMessages: function(){ } };
                    deferred = $q.defer();
                    spyOn(serviceControlService, 'getExceptionGroups').and.callFake(function () {

                        return deferred.promise;
                    });

                    getFailedMessageSpy = spyOn(serviceControlService, 'getFailedMessages').and.callFake(function () {
                        return deferred.promise;
                    });

                    controller = $controller('failedMessagesController',
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

                it('no load happens when initial load is in progress',
                    function () {
                        expect(getFailedMessageSpy).toHaveBeenCalledTimes(1);

                        controller.loadMoreResults(controller.selectedExceptionGroup, true);

                        expect(getFailedMessageSpy).toHaveBeenCalledTimes(1);
                    });

                it('load happens when initial load is done',
                    function () {
                        root.$apply(function () { deferred.resolve({data: []}) });
                        expect(getFailedMessageSpy).toHaveBeenCalledTimes(1);

                        controller.loadMoreResults(controller.selectedExceptionGroup, true);

                        expect(getFailedMessageSpy).toHaveBeenCalledTimes(2);
                    });

            });
    });