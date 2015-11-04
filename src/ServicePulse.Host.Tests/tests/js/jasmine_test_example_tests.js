///<reference path="jasmine_test_example.js"/>

describe('Calculator ', function () {

    // necessary
    it('should add two numbers correctly', function() {
        expect(add(2, 3)).toEqual(5);
    });

    it('should subtract two numbers correctly', function() {
        expect(subtract(3, 2)).toEqual(1);
    });

    // helpful but not needed
    it('should add negative numbers', function() {
        expect(add(-2, -3)).toEqual(-5);
    });
});
