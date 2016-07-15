describe('pendingRetriesController', function () {
    beforeEach(module('sc'));

    var $controller;

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    describe('mark rows as retried', function () {
        var $scope, controller, serviceControlService;

        beforeEach(function () {
            $scope = {};
            serviceControlService = { retryFailedMessages: function() {} };
            controller = $controller('pendingRetriesController', {
                $scope: $scope,
                $timeout: null,
                $location: null,
                scConfig: null,
                toastService: null,
                sharedDataService: { getstats: function () { return { number_of_pending_retries: 0 }; } },
                notifyService: function() {return {subscribe: function() {} } },
                serviceControlService: serviceControlService
            });
        });

        it('two out of three marked as retried', inject(function ($q) {
            spyOn(serviceControlService, 'retryFailedMessages').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('Remote call result');
                return deferred.promise;
            });

            controller.pendingRetryMessages = [{ id: 1, retried: false, selected: true }, { id: 2, retried: false, selected: false }, { id: 3, retried: false, selected: true }];
            controller.selectedIds = [1, 3];
            controller.retrySelected();

            expect(controller.selectedIds.length).toEqual(0);
            expect(controller.pendingRetryMessages[0].retried).toEqual(true);
            expect(controller.pendingRetryMessages[1].retried).toEqual(false);
            expect(controller.pendingRetryMessages[2].retried).toEqual(true);
            expect(controller.pendingRetryMessages[0].selected).toEqual(false);
            expect(controller.pendingRetryMessages[1].selected).toEqual(false);
            expect(controller.pendingRetryMessages[2].selected).toEqual(false);
            expect(serviceControlService.retryFailedMessages).toHaveBeenCalled();
        }));
    });

    describe('mark rows as archived', function () {
        var $scope, controller, serviceControlService;

        beforeEach(function () {
            $scope = {};
            serviceControlService = { archiveFailedMessages: function () { } };
            controller = $controller('pendingRetriesController', {
                $scope: $scope,
                $timeout: null,
                $location: null,
                scConfig: null,
                toastService: null,
                sharedDataService: { getstats: function () { return { number_of_pending_retries: 0 }; } },
                notifyService: function () { return { subscribe: function () { } } },
                serviceControlService: serviceControlService
            });
        });

        it('two out of three marked as archived', inject(function ($q) {
            spyOn(serviceControlService, 'archiveFailedMessages').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('Remote call result');
                return deferred.promise;
            });

            controller.pendingRetryMessages = [{ id: 1, archived: false, selected: true }, { id: 2, archived: false, selected: false }, { id: 3, archived: false, selected: true }];
            controller.selectedIds = [1, 3];
            controller.archiveSelected();

            expect(controller.selectedIds.length).toEqual(0);
            expect(controller.pendingRetryMessages[0].archived).toEqual(true);
            expect(controller.pendingRetryMessages[1].archived).toEqual(false);
            expect(controller.pendingRetryMessages[2].archived).toEqual(true);
            expect(controller.pendingRetryMessages[0].selected).toEqual(false);
            expect(controller.pendingRetryMessages[1].selected).toEqual(false);
            expect(controller.pendingRetryMessages[2].selected).toEqual(false);
            expect(serviceControlService.archiveFailedMessages).toHaveBeenCalled();
        }));
    });

    describe('mark rows as resolved', function () {
        var $scope, controller, serviceControlService;

        beforeEach(function () {
            $scope = {};
            serviceControlService = { markAsResolvedMessages: function () { } };
            controller = $controller('pendingRetriesController', {
                $scope: $scope,
                $timeout: null,
                $location: null,
                scConfig: null,
                toastService: null,
                sharedDataService: { getstats: function () { return { number_of_pending_retries: 0 }; } },
                notifyService: function () { return { subscribe: function () { } } },
                serviceControlService: serviceControlService
            });
        });

        it('two out of three marked as resolved', inject(function ($q) {
            spyOn(serviceControlService, 'markAsResolvedMessages').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('Remote call result');
                return deferred.promise;
            });

            controller.pendingRetryMessages = [{ id: 1, resolved: false, selected: true }, { id: 2, resolved: false, selected: false }, { id: 3, resolved: false, selected: true }];
            controller.selectedIds = [1, 3];
            controller.markAsResolvedSelected();

            expect(controller.selectedIds.length).toEqual(0);
            expect(controller.pendingRetryMessages[0].resolved).toEqual(true);
            expect(controller.pendingRetryMessages[1].resolved).toEqual(false);
            expect(controller.pendingRetryMessages[2].resolved).toEqual(true);
            expect(controller.pendingRetryMessages[0].selected).toEqual(false);
            expect(controller.pendingRetryMessages[1].selected).toEqual(false);
            expect(controller.pendingRetryMessages[2].selected).toEqual(false);
            expect(serviceControlService.markAsResolvedMessages).toHaveBeenCalled();
        }));
    });

    describe('toggle selected', function () {
        var $scope, controller;

        beforeEach(function () {
            $scope = {};
            
            controller = $controller('pendingRetriesController', {
                $scope: $scope,
                $timeout: null,
                $location: null,
                scConfig: null,
                toastService: null,
                sharedDataService: { getstats: function () { return { number_of_pending_retries: 0 }; } },
                notifyService: function () { return { subscribe: function () { } } },
                serviceControlService: null
            });
        });

        it('select row if it was not seleted', inject(function ($q) {
            
            var row = { resolved: false, retried: false, archived: false, selected: false, id: 1 };
            controller.pendingRetryMessages = [row];
            
            controller.toggleRowSelect(row);

            expect(controller.selectedIds.length).toEqual(1);
            expect(row.selected).toEqual(true);
        }));

        it('unselect row if it was seleted', inject(function ($q) {
            
            var row = { resolved: false, retried: false, archived: false, selected: true, id: 1 };
            controller.pendingRetryMessages = [row];
            controller.selectedIds = [1];
            controller.toggleRowSelect(row);

            expect(controller.selectedIds.length).toEqual(0);
            expect(row.selected).toEqual(false);
        }));

        it('do not select row if it is archived', inject(function ($q) {

            var row = { resolved: false, retried: false, archived: true, selected: false, id: 1 };
            controller.pendingRetryMessages = [row];

            controller.toggleRowSelect(row);

            expect(controller.selectedIds.length).toEqual(0);
            expect(row.selected).toEqual(false);
        }));

        it('do not select row if it is retried', inject(function ($q) {

            var row = { resolved: false, retried: true, archived: false, selected: false, id: 1 };
            controller.pendingRetryMessages = [row];

            controller.toggleRowSelect(row);

            expect(controller.selectedIds.length).toEqual(0);
            expect(row.selected).toEqual(false);
        }));

        it('do not select row if it is resolved', inject(function ($q) {

            var row = { resolved: true, retried: false, archived: false, selected: false, id: 1 };
            controller.pendingRetryMessages = [row];

            controller.toggleRowSelect(row);

            expect(controller.selectedIds.length).toEqual(0);
            expect(row.selected).toEqual(false);
        }));

        it('allSelected should be true when all rows are selected', inject(function ($q) {

            var row = { resolved: false, retried: false, archived: false, selected: false, id: 1 };
            controller.pendingRetryMessages = [row];

            controller.toggleRowSelect(row);

            expect(controller.selectedIds.length).toEqual(1);
            expect(row.selected).toEqual(true);
            expect(controller.allSelected).toEqual(true);
        }));

        it('allSelected should be false when not all rows are selected', inject(function ($q) {

            var row = { resolved: false, retried: false, archived: false, selected: false, id: 1 };
            controller.pendingRetryMessages = [row, { resolved: false, retried: false, archived: false, selected: false, id: 2 }];

            controller.toggleRowSelect(row);

            expect(controller.selectedIds.length).toEqual(1);
            expect(row.selected).toEqual(true);
            expect(controller.allSelected).toEqual(false);
        }));
    });

    describe('toggle select all', function() {
        var $scope, controller;

        beforeEach(function() {
            $scope = {};

            controller = $controller('pendingRetriesController', {
                $scope: $scope,
                $timeout: null,
                $location: null,
                scConfig: null,
                toastService: null,
                sharedDataService: { getstats: function() { return { number_of_pending_retries: 0 }; } },
                notifyService: function() { return { subscribe: function() {} } },
                serviceControlService: null
            });
        });

        it('select all rows', inject(function($q) {

            var row = { resolved: false, retried: false, archived: false, selected: false, id: 1 };
            var rowTwo = { resolved: false, retried: false, archived: false, selected: false, id: 2 };
            controller.pendingRetryMessages = [row, rowTwo];

            controller.allSelected = true;
            controller.toggleSelectAll();

            expect(controller.selectedIds.length).toEqual(2);
            expect(row.selected).toEqual(true);
            expect(rowTwo.selected).toEqual(true);
            expect(controller.allSelected).toEqual(true);
        }));

        it('unselect all rows', inject(function ($q) {

            var row = { resolved: false, retried: false, archived: false, selected: true, id: 1 };
            var rowTwo = { resolved: false, retried: false, archived: false, selected: true, id: 2 };
            controller.pendingRetryMessages = [row, rowTwo];
            controller.selectedIds = [row.id, rowTwo.id];

            controller.allSelected = false;
            controller.toggleSelectAll();

            expect(controller.selectedIds.length).toEqual(0);
            expect(row.selected).toEqual(false);
            expect(rowTwo.selected).toEqual(false);
            expect(controller.allSelected).toEqual(false);
        }));
    });
});