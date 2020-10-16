describe('messagesController', function () {

    beforeEach(function () {
        module('sc');
    });

    var $controller;

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    describe('when retrying a message', function () {
        var controller, serviceControlService, root, q, messageEditorModalService, editAndRetryConfig;
        
        beforeEach(inject(function ($rootScope, $q) {
            root = $rootScope;
            q = $q;

            serviceControlService = {
                retryFailedMessages: function() {},
                getFailedMessageById: function() {
                    return $q.defer().promise;
                }
            };
            messageEditorModalService = {
                displayEditMessageModal: function(messageId) {},
            };
            editAndRetryConfig = {
                enabled: true,
                lockedHeaders: [],
                sensitiveHeaders: [],
            };

            controller = $controller("messagesController", {
                $scope: $rootScope.$new(),
                $routeParams: { messageId: "some-message-id" },
                scConfig: null,
                toastService: { showInfo: function () { }, showError: function() {} },
                serviceControlService: serviceControlService,
                archivedMessageService: null,
                notifyService: function () { return { subscribe: function () { } } },
                sharedDataService: {
                    getConfiguration () {
                        return { data_retention: { error_retention_period: 7 } };
                    }
                },
                messageEditorModalService: messageEditorModalService,
                editAndRetryConfig: editAndRetryConfig,
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

        it('and the headers contain content type, GetContentType returns it', function () {
            var originalValue = 'xml';
            var headers = [];
            headers.push({key: 'NServiceBus.ContentType', value: originalValue});
            headers.push({key: 'bla', value:1});
            var headerValue = controller.getContentType(headers);            

            expect(headerValue).toEqual(originalValue);
        });

        it('and the headers are empty GetContentType returns null', function () {
            var headers = [];            
            var headerValue = controller.getContentType(headers);

            expect(headerValue).toEqual(null);
        });
    });

    describe('when deleting a message', function () {
        var controller, serviceControlService, root, messageEditorModalService, editAndRetryConfig;

        beforeEach(inject(function ($rootScope, $q) {
            root = $rootScope;
            
            serviceControlService = {
                archiveFailedMessages: function () { },
                getFailedMessageById: function () {
                    return $q.defer().promise;
                }
            };
            messageEditorModalService = {
                displayEditMessageModal: function(messageId) {},
            };
            editAndRetryConfig = {
                enabled: true,
                lockedHeaders: [],
                sensitiveHeaders: [],
            };

            controller = $controller('messagesController', {
                $scope: {},
                $routeParams: { messageId: "some-message-id" },
                scConfig: null,
                toastService: { showInfo: function () { }, showError: function () { } },
                serviceControlService: serviceControlService,
                archivedMessageService: null,
                notifyService: function () { return { subscribe: function () { } } },
                sharedDataService: {
                    getConfiguration () {
                        return { data_retention: { error_retention_period: 7 } };
                    }
                },
                messageEditorModalService: messageEditorModalService,
                editAndRetryConfig: editAndRetryConfig,
            });
        }));

        it('and deleting succeeds, the message is marked as deleted', inject(function ($q) {
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

        it('and deleting failed, the message is not marked as deleted', inject(function ($q) {
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

    describe('when restoring a message', function () {
        var controller, serviceControlService, root, archivedMessageService, q, messageEditorModalService, editAndRetryConfig;

        beforeEach(inject(function ($rootScope, $q) {
            root = $rootScope;
            q = $q;
            serviceControlService = {
                getFailedMessageById: function () {
                    return $q.defer().promise;
                }
            };
            messageEditorModalService = {
                displayEditMessageModal: function(messageId) {},
            };
            archivedMessageService = { restoreMessageFromArchive: function () { } };
            editAndRetryConfig = {
                enabled: true,
                lockedHeaders: [],
                sensitiveHeaders: [],
            };

            controller = $controller('messagesController', {
                $scope: {},
                $routeParams: { messageId: "some-message-id" },
                scConfig: null,
                toastService: { showInfo: function () { }, showError: function () { } },
                serviceControlService: serviceControlService,
                archivedMessageService: archivedMessageService,
                notifyService: function () { return { subscribe: function () { } } },
                sharedDataService: {
                    getConfiguration () {
                        return { data_retention: { error_retention_period: 7 } };
                    }
                },
                messageEditorModalService: messageEditorModalService,
                editAndRetryConfig: editAndRetryConfig,
            });
        }));

        it('and restoring succeeds, the message is no longer marked as deleted', function () {
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

        it('and restoring fails, the message is remains marked as deleted', function () {
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
