const failedMessagesLinks = (root: string) => {
  function createLink(template: string) {
    return { link: `${root}/${template}`, template: template };
  }

  return {
    root,
    failedMessagesGroups: createLink("failed-message-groups"),
    allFailedMessages: createLink("all-failed-messages"),
    deletedMessagesGroup: createLink("deleted-message-groups"),
    allDeletedMessages: createLink("all-deleted-messages"),
    pendingRetries: createLink("pending-retries"),
    group: { link: (groupId: string) => `${root}/group/${groupId}`, template: "group/:groupId" },
    deletedGroup: { link: (groupId: string) => `${root}/deleted-messages/group/${groupId}`, template: "deleted-messages/group/:groupId" },
    message: { link: (id: string) => `${root}/message/${id}`, template: "message/:id" },
  };
};

const configurationLinks = (root: string) => {
  function createLink(template: string) {
    return { link: `${root}/${template}`, template: template };
  }

  return {
    root,
    license: createLink("license"),
    healthCheckNotifications: createLink("health-check-notifications"),
    retryRedirects: createLink("retry-redirects"),
    connections: createLink("connections"),
    endpointConnection: createLink("endpoint-connection"),
  };
};

const monitoringLinks = (root: string) => {
  return {
    root,
    endpointDetails: { link: (endpointName: string, historyPeriod: number) => `${root}/endpoint/${endpointName}?historyPeriod=${historyPeriod}`, template: "/monitoring/endpoint/:endpointName" },
  };
};

const baseUrl = window.defaultConfig.base_url;

const routeLinks = {
  dashboard: "/dashboard",
  heartbeats: `${baseUrl}a/#/endpoints`,
  monitoring: monitoringLinks("/monitoring"),
  failedMessage: failedMessagesLinks("/failed-messages"),
  customChecks: `${baseUrl}a/#/custom-checks`,
  events: "/events",
  configuration: configurationLinks("/configuration"),
};

export default routeLinks;
