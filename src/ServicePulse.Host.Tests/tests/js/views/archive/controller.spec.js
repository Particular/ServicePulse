describe('archivedMessageController',
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

                    controller = $controller('archivedMessageController',
                        {
                            $scope: root,
                            $interval: function(){},
                            sharedDataService: { getstats: function() { return { number_of_pending_retries: 0 }; }, getConfiguration: function() {return {data_retention: {error_retention_period: "00:00:00"}};} },
                            notifyService: notifyService,
                            serviceControlService: serviceControlService,
                            failedMessageGroupsService: null
                        });
                }));

                it('all messages should be selected',
                    function () {

                        controller.archives = [{id: 0, selected: false}, {id: 1, selected: false}, {id:2, selected: false}];

                        controller.selectAllMessages();

                        expect(controller.archives[0].selected).toEqual(true);
                        expect(controller.archives[1].selected).toEqual(true);
                        expect(controller.archives[2].selected).toEqual(true);
                        expect(controller.selectedIds.length).toEqual(3);
                    });

                it('if any message was selected, all should be unselected',
                    function () {

                        controller.archives = [{id: 0, selected: false}, {id: 1, selected: true}, {id:2, selected: false}];
                        controller.selectedIds = [1];

                        controller.selectAllMessages();

                        expect(controller.archives[0].selected).toEqual(false);
                        expect(controller.archives[1].selected).toEqual(false);
                        expect(controller.archives[2].selected).toEqual(false);
                        expect(controller.selectedIds.length).toEqual(0);
                    });
            });
    });