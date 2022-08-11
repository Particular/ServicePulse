describe('formatter', function () {
    beforeEach(module('sc'));

    var formatter;

    beforeEach(inject( (_formatter_) => {
        formatter = _formatter_;
    }));

    it('should apply hour format to timespans between 60 seconds (1 minute) and 23 hours and 59 minutes ', () => {  
        const nineteenHoursAndFortyMinutesInMs = 70800000;
        const twentyFourMinutesInMs = 24 * 60 * 1000;
        const twoMinutesInMs = 2 * 60 * 1000;
        const twentyThreeHoursFiftyNineMinutesTenSecondsAnd10MsInMs = (((23 * 60 * 60) + (59 * 60) + 10)  * 1000) + 10;
         
        expect(formatter.formatTime(nineteenHoursAndFortyMinutesInMs)).toEqual({value: '19:40', unit: 'hr'});
        expect(formatter.formatTime(twentyFourMinutesInMs)).toEqual({value: '00:24', unit: 'hr'});
        expect(formatter.formatTime(twoMinutesInMs)).toEqual({value: '00:02', unit: 'hr'});
        expect(formatter.formatTime(twentyThreeHoursFiftyNineMinutesTenSecondsAnd10MsInMs)).toEqual({value: '23:59', unit: 'hr'});
    });  

    it('should apply day and hours format to day timespans', () => {  
        const oneDayAndTwelveMinutes = (24 * 60 * 60 + 12 * 60) * 1000;
        const oneDayAndTwelveHours = (24 * 60 * 60 + 12 * 60 * 60) * 1000;

        var result = formatter.formatTime(oneDayAndTwelveMinutes); 
        expect(result.value).toMatch(/1 d 0 hr.*/)
        result = formatter.formatTime(oneDayAndTwelveHours);
        expect(result.value).toMatch(/1 d 12 hr.*/)
    });
    
    it('should format seconds timespans with seconds format', () => {  
        
        const fiftyNineSecondsInMs =  59 * 1000 + 1;
        
        expect(formatter.formatTime(fiftyNineSecondsInMs)).toEqual({value: '59', unit: 'sec'});     
    }); 
});
