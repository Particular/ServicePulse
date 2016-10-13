describe('messagesController', function () {
    beforeEach(module('sc'));

    var $controller;

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    describe('retrying message', function () {
        var $scope, controller, serviceControlService, root;

        beforeEach(inject(function ($rootScope, $injector, $q) {
            $scope = {};
            root = $rootScope;

            serviceControlService = {
                retryFailedMessages: function() {},
                getFailedMessageById: function() {
                    return $q.defer().promise;
                }
            };
            controller = $controller('messagesController', {
                $scope: $scope,
                $routeParams: { messageId: "some-message-id" },
                scConfig: null,
                toastService: { showInfo: function () {} },
                serviceControlService: serviceControlService,
                archivedMessageService: null
            });
        }));

        it('message marked as resolved', inject(function ($q) {
            var deferred = $q.defer();
            spyOn(serviceControlService, 'retryFailedMessages').and.callFake(function () {
                return deferred.promise;
            });

            controller.message = { message_id: 1, retried: false };
            controller.retryMessage();
            
            root.$apply(function () { deferred.resolve('Remote call result') });
            
            expect(controller.message.retried).toEqual(true);
            expect(serviceControlService.retryFailedMessages).toHaveBeenCalled();
        }));

        it('failed, message not marked as resolved', inject(function ($q) {
            var deferred = $q.defer();
            spyOn(serviceControlService, 'retryFailedMessages').and.callFake(function () {
                return deferred.promise;
            });

            controller.message = { message_id: 1, retried: false };
            controller.retryMessage();

            root.$apply(function () { deferred.reject('Remote call result') });

            expect(controller.message.retried).toEqual(false);
            expect(serviceControlService.retryFailedMessages).toHaveBeenCalled();
        }));
    });

    describe('archiving message', function () {
        var $scope, controller, serviceControlService, root;

        beforeEach(inject(function ($rootScope, $injector, $q) {
            $scope = {};
            root = $rootScope;
            
            serviceControlService = {
                archiveFailedMessages: function () { },
                getFailedMessageById: function () {
                    return $q.defer().promise;
                }
            };
            controller = $controller('messagesController', {
                $scope: $scope,
                $routeParams: { messageId: "some-message-id" },
                scConfig: null,
                toastService: { showInfo: function () { } },
                serviceControlService: serviceControlService,
                archivedMessageService: null
            });
        }));

        it('message marked as archived', inject(function ($q) {
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

        it('failed, message not marked as archived', inject(function ($q) {
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

    describe('un-archiving message', function () {
        var $scope, controller, serviceControlService, root, archivedMessageService;

        beforeEach(inject(function ($rootScope, $injector, $q) {
            $scope = {};
            root = $rootScope;
            
            serviceControlService = {
                getFailedMessageById: function () {
                    return $q.defer().promise;
                }
            };
            archivedMessageService = { restoreMessageFromArchive: function () { } };

            controller = $controller('messagesController', {
                $scope: $scope,
                $routeParams: { messageId: "some-message-id" },
                scConfig: null,
                toastService: { showInfo: function () { } },
                serviceControlService: serviceControlService,
                archivedMessageService: archivedMessageService
            });
        }));

        it('message not marked as archived', inject(function ($q) {
            var deferred = $q.defer();
            spyOn(archivedMessageService, 'restoreMessageFromArchive').and.callFake(function () {
                return deferred.promise;
            });

            controller.message = { message_id: 1, archived: true };
            controller.unarchiveMessage();

            root.$apply(function () { deferred.resolve('Remote call result') });

            expect(controller.message.archived).toEqual(false);
            expect(archivedMessageService.restoreMessageFromArchive).toHaveBeenCalled();
        }));

        it('failed, message marked as archived', inject(function ($q) {
            var deferred = $q.defer();
            spyOn(archivedMessageService, 'restoreMessageFromArchive').and.callFake(function () {
                return deferred.promise;
            });

            controller.message = { message_id: 1, archived: true };
            controller.unarchiveMessage();

            root.$apply(function () { deferred.reject('Remote call result') });

            expect(controller.message.archived).toEqual(true);
            expect(archivedMessageService.restoreMessageFromArchive).toHaveBeenCalled();
        }));
    });
});