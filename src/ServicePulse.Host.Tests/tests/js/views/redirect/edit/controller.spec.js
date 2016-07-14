describe('editRedirectController', function () {
    beforeEach(module('sc'));

    var $controller;

    beforeEach(inject(function (_$controller_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));

    describe('add new redirect', function () {
        var $scope, controller, redirectService;

        beforeEach(function () {
            $scope = {};
            redirectService = { createRedirect: function() {} };
            controller = $controller('editRedirectController', {
                $scope: $scope,
                $uibModalInstance: null,
                redirectService: redirectService,
                toastService: null,
                serviceControlService: null,
                data: {
                    success: '',
                    error: '',
                    saveButtonText: '',
                    title: ''
                }
            });
        });

        it('initiate from and to queue with empty string', function () {
            expect($scope.from_physical_address).toEqual('');
            expect($scope.to_physical_address).toEqual('');
        });

        it('when calling createRedirect redirectService.createRedirect is being called', inject(function ($q) {
            spyOn(redirectService, 'createRedirect').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('Remote call result');
                return deferred.promise;
            });;
            $scope.redirectForm = { $invalid: false };

            $scope.createRedirect();
            expect(redirectService.createRedirect).toHaveBeenCalled();

        }));
    });

    describe('edit a redirect', function () {
        var $scope, controller, redirectService;

        beforeEach(function () {
            $scope = {};
            redirectService = { updateRedirect: function () { } };
            controller = $controller('editRedirectController', {
                $scope: $scope,
                $uibModalInstance: null,
                redirectService: redirectService,
                toastService: null,
                serviceControlService: null,
                data: {
                    success: '',
                    error: '',
                    saveButtonText: '',
                    title: '',
                    redirect: {
                        message_redirect_id: 'messageId',
                        from_physical_address: 'from_physical_address',
                        to_physical_address: 'to_physical_address'
                    }
                }
            });
        });

        it('initiate from and to queue with provided data', function () {
            expect($scope.from_physical_address).toEqual('from_physical_address');
            expect($scope.to_physical_address).toEqual('to_physical_address');
            expect($scope.message_redirect_id).toEqual('messageId');
        });

        it('when calling createRedirect redirectService.updateRedirect is being called', inject(function ($q) {
            spyOn(redirectService, 'updateRedirect').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('Remote call result');
                return deferred.promise;
            });;
            $scope.redirectForm = { $invalid: false };

            $scope.createRedirect();
            expect(redirectService.updateRedirect).toHaveBeenCalled();

        }));
    });
});