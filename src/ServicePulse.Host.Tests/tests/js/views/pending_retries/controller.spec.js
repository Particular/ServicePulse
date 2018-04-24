describe('pendingRetriesController', function () {
    beforeEach(module('sc'));

    var $controller;

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    describe('mark rows as retried', function () {
        var $scope, controller, pendingRetryService, root, $httpBackend;

        beforeEach(inject(function ($rootScope, $injector) {
            $scope = {};
            root = $rootScope;
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.whenGET('http://localhost:33333/api/errors/queues/addresses').respond(null);
            $httpBackend.whenGET('http://localhost:33333/api/redirects').respond(null);

            pendingRetryService = { retryPendingRetriedMessages: function () { } };
            controller = $controller('pendingRetriesController', {
                $scope: $scope,
                $timeout: null,
                $location: null,
                scConfig: null,
                toastService: { showInfo: function () {} },
                endpointService: null,
                sharedDataService: { getstats: function () { return { number_of_pending_retries: 0 }; } },
                notifyService: function() {return {subscribe: function() {} } },
                pendingRetryService: pendingRetryService
            });
        }));

        it('two out of three marked as submitted for retrial', inject(function ($q) {
            var deferred = $q.defer();
            spyOn(pendingRetryService, 'retryPendingRetriedMessages').and.callFake(function() {
                return deferred.promise;
            });

            controller.pendingRetryMessages = [{ id: 1, submittedForRetrial: false, selected: true }, { id: 2, submittedForRetrial: false, selected: false }, { id: 3, submittedForRetrial: false, selected: true }];
            controller.selectedIds = [1, 3];
            controller.retrySelected();
            
            root.$apply(function () { deferred.resolve('Remote call result') });

            expect(controller.selectedIds.length).toEqual(0);
            expect(controller.pendingRetryMessages[0].submittedForRetrial).toEqual(true);
            expect(controller.pendingRetryMessages[1].submittedForRetrial).toEqual(false);
            expect(controller.pendingRetryMessages[2].submittedForRetrial).toEqual(true);
            expect(controller.pendingRetryMessages[0].selected).toEqual(false);
            expect(controller.pendingRetryMessages[1].selected).toEqual(false);
            expect(controller.pendingRetryMessages[2].selected).toEqual(false);
            expect(pendingRetryService.retryPendingRetriedMessages).toHaveBeenCalled();
        }));
    });

    describe('mark all rows as submitted for retrial', function () {
        var $scope, controller, pendingRetryService, root, $httpBackend;

        beforeEach(inject(function ($rootScope, $injector) {
            $scope = {};
            root = $rootScope;
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.whenGET('http://localhost:33333/api/errors/queues/addresses').respond(null);
            $httpBackend.whenGET('http://localhost:33333/api/redirects').respond(null);

            pendingRetryService = { retryAllMessages: function () { } };
            controller = $controller('pendingRetriesController', {
                $scope: $scope,
                $timeout: null,
                $location: null,
                scConfig: null,
                toastService: { showInfo: function () {} },
                endpointService: null,
                sharedDataService: { getstats: function () { return { number_of_pending_retries: 0 }; } },
                notifyService: function () { return { subscribe: function () { } } },
                pendingRetryService: pendingRetryService
            });
        }));

        it('all messages marked as submitted for retrial', inject(function ($q) {
            var deferred = $q.defer();
            spyOn(pendingRetryService, 'retryAllMessages').and.callFake(function() {
                return deferred.promise;
            });

            controller.pendingRetryMessages = [{ id: 1, submittedForRetrial: false, selected: false }, { id: 2, submittedForRetrial: false, selected: true }, { id: 3, submittedForRetrial: false, selected: false }];
            controller.selectedIds = [2];
            controller.filter = {
                searchPhrase: { physical_address: '' }
            };
            controller.retryAll();

            root.$apply(function () { deferred.resolve('Remote call result') });

            expect(controller.selectedIds.length).toEqual(0);
            expect(controller.pendingRetryMessages[0].submittedForRetrial).toEqual(true);
            expect(controller.pendingRetryMessages[1].submittedForRetrial).toEqual(true);
            expect(controller.pendingRetryMessages[2].submittedForRetrial).toEqual(true);
            expect(controller.pendingRetryMessages[0].selected).toEqual(false);
            expect(controller.pendingRetryMessages[1].selected).toEqual(false);
            expect(controller.pendingRetryMessages[2].selected).toEqual(false);
            expect(pendingRetryService.retryAllMessages).toHaveBeenCalled();
        }));
    });

    describe('mark rows as resolved', function () {
        var $scope, controller, pendingRetryService, root, $httpBackend;

        beforeEach(inject(function ($rootScope, $injector) {
            $scope = {};
            root = $rootScope;
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.whenGET('http://localhost:33333/api/errors/queues/addresses').respond(null);
            $httpBackend.whenGET('http://localhost:33333/api/redirects').respond(null);
            pendingRetryService = { markAsResolvedMessages: function () { } };
            controller = $controller('pendingRetriesController', {
                $scope: $scope,
                $timeout: null,
                $location: null,
                scConfig: null,
                toastService: { showInfo: function () {} },
                endpointService: null,
                sharedDataService: { getstats: function () { return { number_of_pending_retries: 0 }; } },
                notifyService: function () { return { subscribe: function () { } } },
                pendingRetryService: pendingRetryService
            });
        }));

        it('two out of three marked as resolved', inject(function ($q) {
            var deferred = $q.defer();
            spyOn(pendingRetryService, 'markAsResolvedMessages').and.callFake(function () {
                return deferred.promise;
            });

            controller.pendingRetryMessages = [{ id: 1, resolved: false, selected: true }, { id: 2, resolved: false, selected: false }, { id: 3, resolved: false, selected: true }];
            controller.selectedIds = [1, 3];
            controller.markAsResolvedSelected();
            root.$apply(function () { deferred.resolve('Remote call result') });

            expect(controller.selectedIds.length).toEqual(0);
            expect(controller.pendingRetryMessages[0].resolved).toEqual(true);
            expect(controller.pendingRetryMessages[1].resolved).toEqual(false);
            expect(controller.pendingRetryMessages[2].resolved).toEqual(true);
            expect(controller.pendingRetryMessages[0].selected).toEqual(false);
            expect(controller.pendingRetryMessages[1].selected).toEqual(false);
            expect(controller.pendingRetryMessages[2].selected).toEqual(false);
            expect(pendingRetryService.markAsResolvedMessages).toHaveBeenCalled();
        }));
    });

    describe('mark all rows as resolved', function () {
        var $scope, controller, pendingRetryService, root, $httpBackend;

        beforeEach(inject(function ($rootScope, $injector) {
            $scope = {};
            root = $rootScope;
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.whenGET('http://localhost:33333/api/errors/queues/addresses').respond(null);
            $httpBackend.whenGET('http://localhost:33333/api/redirects').respond(null);
            pendingRetryService = { markAsResolvedAllMessages: function () { } };
            controller = $controller('pendingRetriesController', {
                $scope: $scope,
                $timeout: null,
                $location: null,
                scConfig: null,
                toastService: { showInfo: function () { } },
                endpointService: null,
                sharedDataService: { getstats: function () { return { number_of_pending_retries: 0 }; } },
                notifyService: function () { return { subscribe: function () { } } },
                pendingRetryService: pendingRetryService
            });
        }));

        it('all messages marked as resolved', inject(function ($q) {
            var deferred = $q.defer();
            spyOn(pendingRetryService, 'markAsResolvedAllMessages').and.callFake(function () {
                return deferred.promise;
            });

            controller.pendingRetryMessages = [{ id: 1, resolved: false, selected: false }, { id: 2, resolved: false, selected: true }, { id: 3, resolved: false, selected: false }];
            controller.selectedIds = [2];
            controller.markAsResolvedAll();
            root.$apply(function () { deferred.resolve('Remote call result') });

            expect(controller.selectedIds.length).toEqual(0);
            expect(controller.pendingRetryMessages[0].resolved).toEqual(true);
            expect(controller.pendingRetryMessages[1].resolved).toEqual(true);
            expect(controller.pendingRetryMessages[2].resolved).toEqual(true);
            expect(controller.pendingRetryMessages[0].selected).toEqual(false);
            expect(controller.pendingRetryMessages[1].selected).toEqual(false);
            expect(controller.pendingRetryMessages[2].selected).toEqual(false);
            expect(pendingRetryService.markAsResolvedAllMessages).toHaveBeenCalled();
        }));
    });

    describe('status present', function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};

            controller = $controller('pendingRetriesController', {
                $scope: $scope,
                $timeout: null,
                $location: null,
                scConfig: null,
                toastService: null,
                endpointService: null,
                sharedDataService: { getstats: function() { return { number_of_pending_retries: 0 }; } },
                notifyService: function() { return { subscribe: function() {} } },
                serviceControlService: null
            });
        });

        it('returns false when message is retried', inject(function($q) {

            var message = { retried: true, number_of_processing_attempts: 1 };

            var result = controller.noStatusPresent(message);
            
            expect(result).toEqual(false);
        }));

        it('returns false when message is submitted for retrial', inject(function ($q) {

            var message = { submittedForRetrial: true, number_of_processing_attempts: 1 };

            var result = controller.noStatusPresent(message);

            expect(result).toEqual(false);
        }));

        it('returns false when message is resolved', inject(function ($q) {

            var message = { resolved: true, number_of_processing_attempts: 1 };

            var result = controller.noStatusPresent(message);

            expect(result).toEqual(false);
        }));

        it('returns false when message was proccessed more than once', inject(function ($q) {

            var message = { number_of_processing_attempts: 2 };

            var result = controller.noStatusPresent(message);

            expect(result).toEqual(false);
        }));

        it('returns true when message was processed once, is not resolved nor retried', inject(function ($q) {

            var message = { number_of_processing_attempts: 1 };
            var messageTwo = { retried: false, resolved: false, number_of_processing_attempts: 1 };

            var result = controller.noStatusPresent(message);
            var resultSecond = controller.noStatusPresent(messageTwo);

            expect(result).toEqual(true);
            expect(resultSecond).toEqual(resultSecond);
        }));
    });

    describe('are filters selected', function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};

            controller = $controller('pendingRetriesController', {
                $scope: $scope,
                $timeout: null,
                $location: null,
                scConfig: null,
                toastService: null,
                endpointService: null,
                sharedDataService: { getstats: function() { return { number_of_pending_retries: 0 }; } },
                notifyService: function() { return { subscribe: function() {} } },
                serviceControlService: null
            });
        });

        it('returns true when queue is chosen', inject(function($q) {

            controller.filter.searchPhrase = 'queue1@machine';
            var result = controller.areFiltersSelected();

            expect(result).toEqual(true);
        }));

        it('returns true when start and end is filled', inject(function ($q) {

            controller.filter.start = '2016/01/01';
            controller.filter.end = '2016/02/01';
            var result = controller.areFiltersSelected();

            expect(result).toEqual(true);
        }));

        it('returns false when queue is not chosen and start/end dates are empty', inject(function ($q) {
            var result = controller.areFiltersSelected();

            expect(result).toEqual(false);
        }));
    });
});