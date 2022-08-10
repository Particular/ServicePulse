describe('formatter', function () {
    beforeEach(module('sc'));

    var formatter;

    beforeEach(inject( (_formatter_) => {
        formatter = _formatter_;
    }));

    it('should format time value with hour format', () => {        
        expect(formatter.formatTime(70825325).value).toEqual('19:40');        
    });   
});
