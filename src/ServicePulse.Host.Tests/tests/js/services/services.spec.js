/// <reference path="../_references.js" />

describe("Unit: Uri Service ", function() {

    it('should load angular', function() {
        expect(typeof (angular) == typeof (undefined)).toEqual(false);
    });

    describe("Uri Joins:", function() {

        beforeEach(module('sc'));

        it('should contain a uri service',
            inject(function(uri) {
                expect(typeof (uri) == typeof(undefined)).toEqual(false);
            }));

        it('should make a url for eventlogitems', inject(function(uri) {
            var url = uri.join('http://localhost:33333/api/', 'eventlogitems');
            expect(url).toEqual('http://localhost:33333/api/eventlogitems');
        }));

        it('should make a url for get Failed Messages For Exception Group', inject(function (uri, scConfig) {
            var groupId = '85147b12-458c-431d-a389-35ea53abc9e1';
            var page = 1;
            var sortBy = 'time_sent';
            var url = uri.join(scConfig.service_control_url, 'recoverability', 'groups', groupId, 'errors?page=' + page + '&sort=' + sortBy);
            expect(url).toEqual('http://localhost:33333/api/recoverability/groups/85147b12-458c-431d-a389-35ea53abc9e1/errors?page=1&sort=time_sent');
        }));


        it('should make a url for get Failed Messages For Exception Group', inject(function (uri, scConfig) {
            var messageId = '85147b12-458c-431d-a389-35ea53abc9e1';
            var url = uri.join(scConfig.service_control_url, 'messages', messageId, 'body');
            expect(url).toEqual('http://localhost:33333/api/messages/85147b12-458c-431d-a389-35ea53abc9e1/body');
        }));


        it('should make a url for getMessageBody', inject(function (uri, scConfig) {
            var messageId = '85147b12-458c-431d-a389-35ea53abc9e1';
            var url = uri.join(scConfig.service_control_url, 'messages', messageId, 'body');
            expect(url).toEqual('http://localhost:33333/api/messages/85147b12-458c-431d-a389-35ea53abc9e1/body');
        }));

        it('should make a url for getMessageHeaders', inject(function (uri, scConfig) {
            var messageId = '85147b12-458c-431d-a389-35ea53abc9e1';
            var url = uri.join(scConfig.service_control_url, 'messages', 'search', messageId);
            expect(url).toEqual('http://localhost:33333/api/messages/search/85147b12-458c-431d-a389-35ea53abc9e1');
        }));

        it('should make a url for getTotalFailedMessages', inject(function (uri, scConfig) {

            var url = uri.join(scConfig.service_control_url, 'errors?status=unresolved');
            expect(url).toEqual('http://localhost:33333/api/errors?status=unresolved');
        }));

        it('should make a url for retry errors', inject(function (uri, scConfig) {
            var url = uri.join(scConfig.service_control_url, 'errors', 'retry');
            expect(url).toEqual('http://localhost:33333/api/errors/retry');
        }));

    });
});