describe('messageTypeParser', function () {
    beforeEach(module('services.messageTypeParser'));

    var oneTypeMessageType = {
        "id": "IMyEvent, Shared, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null",
        "typeName": "IMyEvent",
        "assemblyName": "Shared",
        "assemblyVersion": "0.0.0.0",
        "culture": "",
        "publicKeyToken": ""
    };
    var twoTypeMessageType = {
        "id":
            "Some.Very.Long.Shared.Namespace.Is.Found.Here.EventMessage, Shared, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null;IMyEvent, Shared, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null",
        "typeName":
            "Some.Very.Long.Shared.Namespace.Is.Found.Here.EventMessage, Shared, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null;IMyEvent, Shared, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null",
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
        messageTypeParser.parseTheMessageTypeData(oneTypeMessageType);

        expect(oneTypeMessageType.typeName).toEqual('IMyEvent');
        expect(oneTypeMessageType.assemblyName).toEqual('Shared');
    });

    it('should parse message type if there is more than one class in', function () {
        messageTypeParser.parseTheMessageTypeData(twoTypeMessageType);

        expect(twoTypeMessageType.typeName).toEqual('Some.Very.Long.Shared.Namespace.Is.Found.Here.EventMessage, IMyEvent');
        expect(twoTypeMessageType.assemblyName).toEqual(null);
        expect(twoTypeMessageType.messageTypeHierarchy[0].typeName).toEqual('Some.Very.Long.Shared.Namespace.Is.Found.Here.EventMessage');
        expect(twoTypeMessageType.messageTypeHierarchy[1].typeName).toEqual('IMyEvent');
        expect(twoTypeMessageType.messageTypeHierarchy[0].assemblyName).toEqual(' Shared');
        expect(twoTypeMessageType.messageTypeHierarchy[1].assemblyName).toEqual(' Shared');
    });
});