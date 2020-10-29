if (typeof Object.assign != 'function') {
    Object.assign = function(target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(search, this_len) {
        if (this_len === undefined || this_len > this.length) {
            this_len = this.length;
        }
        return this.substring(this_len - search.length, this_len) === search;
    };
}

describe('messageTypeParser', function () {
    beforeEach(module('services.messageTypeParser'));

    var oneTypeMessageType = {
        "id": "IMyEvent, Shared, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null",
        "typeName": "IMyEvent",
        "assemblyName": "Shared",
        "assemblyVersion": "0.0.0.0",
        "culture": "Neutral",
        "publicKeyToken": "123123123"
    };
    var twoTypeMessageType = {
        "id":
            "Some.Very.Long.Shared.Namespace.Is.Found.Here.EventMessage, Shared, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null;IMyEvent, Shared, Version=0.0.0.0, Culture=neutral, PublicKeyToken=123123123",
        "typeName":
            "Some.Very.Long.Shared.Namespace.Is.Found.Here.EventMessage, Shared, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null;IMyEvent, Shared, Version=0.0.0.0, Culture=neutral, PublicKeyToken=123123123",
        "assemblyName": null,
        "assemblyVersion": null,
        "culture": null,
        "publicKeyToken": null
    };


    var messageTypeParser;

    beforeEach(inject(function (_messageTypeParser_) {
        messageTypeParser = _messageTypeParser_;
    }));

    it('should not parse message type if there is only one class in', function () {
        var sut = {};
        Object.assign(sut, oneTypeMessageType);
        messageTypeParser.parseTheMessageTypeData(sut);

        expect(sut.typeName).toEqual('IMyEvent');
        expect(sut.assemblyName).toEqual('Shared');
    });

    it('should parse messageTypes as well as shortNames without an unknown result', function() {
        var sut = {};
        Object.assign(sut, twoTypeMessageType);

        messageTypeParser.parseTheMessageTypeData(sut);

        expect(sut.typeName).toEqual('Some.Very.Long.Shared.Namespace.Is.Found.Here.EventMessage, IMyEvent');
        expect(sut.shortName).toEqual('EventMessage, IMyEvent');
    });

    it('should parse message type if there is more than one class in', function () {
        var sut = {};
        Object.assign(sut, twoTypeMessageType);
        messageTypeParser.parseTheMessageTypeData(sut);

        expect(sut.typeName).toEqual('Some.Very.Long.Shared.Namespace.Is.Found.Here.EventMessage, IMyEvent');
        expect(sut.assemblyName).toEqual(null);
        expect(sut.messageTypeHierarchy[0].typeName).toEqual('Some.Very.Long.Shared.Namespace.Is.Found.Here.EventMessage');
        expect(sut.messageTypeHierarchy[1].typeName).toEqual('IMyEvent');
        expect(sut.messageTypeHierarchy[0].assemblyName).toEqual(' Shared');
        expect(sut.messageTypeHierarchy[1].assemblyName).toEqual(' Shared');
    });

    it('should fill tooltip text with all parameters when present', function () {
        var sut = {};
        Object.assign(sut, oneTypeMessageType);
        messageTypeParser.parseTheMessageTypeData(sut);

        expect(sut.tooltipText).toEqual('IMyEvent | Shared-0.0.0.0 | Culture=Neutral | PublicKeyToken=123123123');
    });

    it('should fill tooltip text with all parameters from both types when present', function () {
        var sut = {};
        Object.assign(sut, twoTypeMessageType);
        messageTypeParser.parseTheMessageTypeData(sut);

        expect(sut.tooltipText).toEqual('Some.Very.Long.Shared.Namespace.Is.Found.Here.EventMessage | Shared-0.0.0.0<br> IMyEvent | Shared-0.0.0.0 | Culture=neutral | PublicKeyToken=123123123');
    });

});