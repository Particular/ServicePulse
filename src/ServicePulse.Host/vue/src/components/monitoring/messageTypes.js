function shortenTypeName(typeName) {
  return typeName.split(".").pop();
}

function parseTheMessageTypeData(messageType) {
  if (messageType.typeName.indexOf(";") > 0) {
    let messageTypeHierarchy = messageType.typeName.split(";");
    messageTypeHierarchy = messageTypeHierarchy.map((item) => {
      const obj = {};
      const segments = item.split(",");
      obj.typeName = segments[0];
      obj.assemblyName = segments[1];
      obj.assemblyVersion = segments[2].substring(segments[2].indexOf("=") + 1);

      if (!segments[4].endsWith("=null")) {
        //SC monitoring fills culture only if PublicKeyToken is filled
        obj.culture = segments[3];
        obj.publicKeyToken = segments[4];
      }
      return obj;
    });
    return {
      ...messageType,
      messageTypeHierarchy,
      typeName: messageTypeHierarchy.map((item) => item.typeName).join(", "),
      shortName: messageTypeHierarchy.map((item) => shortenTypeName(item.typeName)).join(", "),
      containsTypeHierarchy: true,
      tooltipText: messageTypeHierarchy.reduce(
        (sum, item) => (sum ? `${sum}<br> ` : "") + `${item.typeName} |${item.assemblyName}-${item.assemblyVersion}` + (item.culture ? ` |${item.culture}` : "") + (item.publicKeyToken ? ` |${item.publicKeyToken}` : ""),
        ""
      ),
    };
  }
  let tooltip = `${messageType.typeName} | ${messageType.assemblyName}-${messageType.assemblyVersion}`;
  if (messageType.culture && messageType.culture !== "null") {
    tooltip += ` | Culture=${messageType.culture}`;
  }

  if (messageType.publicKeyToken && messageType.publicKeyToken !== "null") {
    tooltip += ` | PublicKeyToken=${messageType.publicKeyToken}`;
  }

  return {
    ...messageType,
    shortName: shortenTypeName(messageType.typeName),
    tooltip,
  };
}

export default class messageTypes {
  constructor(rawMessageTypes) {
    this.totalItems = rawMessageTypes.length;
    this.data = rawMessageTypes
      // filter out system message types
      .filter((mt) => mt.id && mt.typeName)
      .map((mt) => parseTheMessageTypeData(mt))
      .sort((a, b) => a.typeName.localeCompare(b.typeName));
  }
}
