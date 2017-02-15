describe('messagesController', function () {

    beforeEach(function () {
        module('sc');
    });

    var $controller;

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    describe('when retrying a message', function () {
        var controller, serviceControlService, root, q;
        
        beforeEach(inject(function ($rootScope, $q) {
            root = $rootScope;
            q = $q;

            serviceControlService = {
                retryFailedMessages: function() {},
                getFailedMessageById: function() {
                    return $q.defer().promise;
                }
            };

            controller = $controller("messagesController", {
                $scope: $rootScope.$new(),
                $routeParams: { messageId: "some-message-id" },
                scConfig: null,
                toastService: { showInfo: function () {} },
                serviceControlService: serviceControlService,
                archivedMessageService: null,
                notifyService: function () { return { subscribe: function () { } } },
                sharedDataService: {
                    getConfiguration () {
                        return { data_retention: { error_retention_period: 7 } };
                    }
                }
            });
        }));

        it('and the retry succeeds, the message is marked as resolved', function () {
            var deferred = q.defer();
            spyOn(serviceControlService, 'retryFailedMessages').and.callFake(function () {
                return deferred.promise;
            });

            controller.message = { message_id: 1, retried: false };
            controller.retryMessage();
            
            root.$apply(function () { deferred.resolve('Remote call result') });
            
            expect(controller.message.retried).toEqual(true);
            expect(serviceControlService.retryFailedMessages).toHaveBeenCalled();
        });

        it('and the retry fails, the message is not marked as resolved', function () {
            var deferred = q.defer();
            spyOn(serviceControlService, 'retryFailedMessages').and.callFake(function () {
                return deferred.promise;
            });

            controller.message = { message_id: 1, retried: false };
            controller.retryMessage();

            root.$apply(function () { deferred.reject('Remote call result') });

            expect(controller.message.retried).toEqual(false);
            expect(serviceControlService.retryFailedMessages).toHaveBeenCalled();
        });
    });

    describe('when archiving a message', function () {
        var controller, serviceControlService, root;

        beforeEach(inject(function ($rootScope, $q) {
            root = $rootScope;
            
            serviceControlService = {
                archiveFailedMessages: function () { },
                getFailedMessageById: function () {
                    return $q.defer().promise;
                }
            };
            controller = $controller('messagesController', {
                $scope: {},
                $routeParams: { messageId: "some-message-id" },
                scConfig: null,
                toastService: { showInfo: function () { } },
                serviceControlService: serviceControlService,
                archivedMessageService: null,
                notifyService: function () { return { subscribe: function () { } } },
                sharedDataService: {
                    getConfiguration () {
                        return { data_retention: { error_retention_period: 7 } };
                    }
                }
            });
        }));

        it('and the archive succeeds, the message is marked as archived', inject(function ($q) {
            var deferred = $q.defer();
            spyOn(serviceControlService, 'archiveFailedMessages').and.callFake(function () {
                return deferred.promise;
            });

            controller.message = { message_id: 1, archived: false };
            controller.archiveMessage();

            root.$apply(function () { deferred.resolve('Remote call result') });

            expect(controller.message.archived).toEqual(true);
            expect(serviceControlService.archiveFailedMessages).toHaveBeenCalled();
        }));

        it('and the archive failed, the message is not marked as archived', inject(function ($q) {
            var deferred = $q.defer();
            spyOn(serviceControlService, 'archiveFailedMessages').and.callFake(function () {
                return deferred.promise;
            });

            controller.message = { message_id: 1, archived: false };
            controller.archiveMessage();

            root.$apply(function () { deferred.reject('Remote call result') });

            expect(controller.message.archived).toEqual(false);
            expect(serviceControlService.archiveFailedMessages).toHaveBeenCalled();
        }));
    });

    describe('when unarchiving a message', function () {
        var controller, serviceControlService, root, archivedMessageService, q;

        beforeEach(inject(function ($rootScope, $q) {
            root = $rootScope;
            q = $q;
            serviceControlService = {
                getFailedMessageById: function () {
                    return $q.defer().promise;
                }
            };
            archivedMessageService = { restoreMessageFromArchive: function () { } };

            controller = $controller('messagesController', {
                $scope: {},
                $routeParams: { messageId: "some-message-id" },
                scConfig: null,
                toastService: { showInfo: function () { } },
                serviceControlService: serviceControlService,
                archivedMessageService: archivedMessageService,
                notifyService: function () { return { subscribe: function () { } } },
                sharedDataService: {
                    getConfiguration () {
                        return { data_retention: { error_retention_period: 7 } };
                    }
                }
            });
        }));

        it('and the unarchive succeeds, the message is not marked as archived', function () {
            var deferred = q.defer();
            spyOn(archivedMessageService, 'restoreMessageFromArchive').and.callFake(function () {
                return deferred.promise;
            });

            controller.message = { message_id: 1, archived: true };
            controller.unarchiveMessage();

            root.$apply(function () { deferred.resolve('Remote call result') });

            expect(controller.message.archived).toEqual(false);
            expect(archivedMessageService.restoreMessageFromArchive).toHaveBeenCalled();
        });

        it('and the unarchive fails, the message is still marked as archived', function () {
            var deferred = q.defer();
            spyOn(archivedMessageService, 'restoreMessageFromArchive').and.callFake(function () {
                return deferred.promise;
            });

            controller.message = { message_id: 1, archived: true };
            controller.unarchiveMessage();

            root.$apply(function () { deferred.reject('Remote call result') });

            expect(controller.message.archived).toEqual(true);
            expect(archivedMessageService.restoreMessageFromArchive).toHaveBeenCalled();
        });
    });
});