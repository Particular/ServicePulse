
function join( /* path segments */) {
    // Split the inputs into a list of path commands.
    var parts = [];
    for (var i = 0; i < arguments.length; i++) {
        parts = parts.concat(('' + arguments[i]).replace(/\/$/, ''));
    }

    // Turn back into a single string path.
    return parts.join('/');
};

var scConfig = scConfig || {};
scConfig.service_control_url = 'http://localhost:33333/api/';

describe('Join Tests ', function() {


    it('should make a url for eventlogitems', function() {
        var url = join(scConfig.service_control_url, 'eventlogitems');
        expect(url).toEqual('http://localhost:33333/api/eventlogitems');
    });

    it('should make a url for get Failed Messages For Exception Group', function() {
        var groupId = '85147b12-458c-431d-a389-35ea53abc9e1';
        var page = 1;
        var sortBy = 'time_sent';
        var url = join(scConfig.service_control_url, 'recoverability', 'groups', groupId, 'errors?page=' + page + '&sort=' + sortBy);
        expect(url).toEqual('http://localhost:33333/api/recoverability/groups/85147b12-458c-431d-a389-35ea53abc9e1/errors?page=1&sort=time_sent');
    });

    it('should make a url for get Failed Messages For Exception Group', function() {
        var messageId = '85147b12-458c-431d-a389-35ea53abc9e1';
        var url = join(scConfig.service_control_url, 'messages', messageId, 'body');
        expect(url).toEqual('http://localhost:33333/api/messages/85147b12-458c-431d-a389-35ea53abc9e1/body');
    });


    it('should make a url for getMessageBody', function() {
        var messageId = '85147b12-458c-431d-a389-35ea53abc9e1';
        var url = join(scConfig.service_control_url, 'messages', messageId, 'body');
        expect(url).toEqual('http://localhost:33333/api/messages/85147b12-458c-431d-a389-35ea53abc9e1/body');
    });

    it('should make a url for getMessageHeaders', function () {
        var messageId = '85147b12-458c-431d-a389-35ea53abc9e1';
        var url = join(scConfig.service_control_url, 'messages', 'search', messageId);
        expect(url).toEqual('http://localhost:33333/api/messages/search/85147b12-458c-431d-a389-35ea53abc9e1');
    });

    it('should make a url for getTotalFailedMessages', function () {
       
        var url = join(scConfig.service_control_url, 'errors?status=unresolved');
        expect(url).toEqual('http://localhost:33333/api/errors?status=unresolved');
    });
   
    it('should make a url for getTotalFailedMessages', function () {
        var selectedMessages = ['85147b12-458c-431d-a389-35ea53abc9e1', 'e2c89d2f-b2f9-417d-8a80-03bdff607577'];

        var url = join(scConfig.service_control_url, 'errors', 'retry', selectedMessages);
        expect(url).toEqual('http://localhost:33333/api/errors?status=unresolved');
    });

});