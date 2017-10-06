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

    it('number below 1000 should be left intact', function () {
        var value = 301, result;
        
        result = $filter('largeNumber')(value, 0) * 1;
        
        expect(result).toEqual(value);
    });

    it('number value is equal 1200 should return 1k', function () {
        var value = 1200, result;

        result = $filter('largeNumber')(value, '0');

        expect(result).toEqual('1k');
    });

    it('number value is greater than 1 million should return 1M', function () {
        var value = 1000000, result;

        result = $filter('largeNumber')(value, '0');

        expect(result).toEqual('1M');
    });
});