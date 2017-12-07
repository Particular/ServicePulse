describe('Large Number Filter', function () {
    'use strict';

    var $filter;

    beforeEach(function () {
        module('sc');
        module('ui.particular.largenumber');

        inject(function (_$filter_) {
            $filter = _$filter_;
        });
    });

    it('number without decimal places should be formatted without decimals', function () {
        var value = 9, result;

        result = $filter('largeNumber')(value, 2);

        expect(result).toEqual(value);
    });

    it('number below 1000 should be left intact', function () {
        var value = 301, result;
        
        result = $filter('largeNumber')(value, 0) * 1;
        
        expect(result).toEqual(value);
    });

    it('number value is equal 1200 should return 1200', function () {
        var value = 1200, result;

        result = $filter('largeNumber')(value, '0');

        expect(result).toEqual(1200);
    });

    it('number value is greater than 1 million should return 1M', function () {
        var value = 1000000, result;

        result = $filter('largeNumber')(value, '0');

        expect(result).toEqual('1M');
    });

    it('number value is 123000 should return 1.2M, when precision is set to 1', function () {
        var value = 1230000, result;

        result = $filter('largeNumber')(value, 1);

        expect(result).toEqual('1.2M');
    });
});