/// <reference path="_references.js" />

describe('Angular libraries available in tests', function () {

    //fails
    it('should load angular.mock.module', function () {
        expect(typeof (angular.mock.module) == typeof (undefined)).toEqual(false);
    });

    //fails
    it('should load window.module', function () {
        expect(typeof (module) == typeof (undefined)).toEqual(false);
    });

    //passes
    it('should load angular', function () {
        expect(typeof (angular) == typeof (undefined)).toEqual(false);
    });

    //passes
    it('should load angular.mock', function () {
        expect(typeof (angular.mock) == typeof (undefined)).toEqual(false);
    });

});


var myApp = angular.module('myApp', []);

myApp.controller('HelloWorldController', ['$scope', function ($scope) {
    $scope.greeting = 'Hello World!';
}]);

describe('Hello World example ', function () {

    beforeEach(module('myApp'));

    var HelloWorldController,
    scope;

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        HelloWorldController = $controller('HelloWorldController', {
            $scope: scope
        });
    }));

    it('says hello world!', function () {
        expect(scope.greeting).toEqual('Hello World!');
    });

    it('hello!', function () {
        expect('hello!').toEqual('hello!');
    });

});