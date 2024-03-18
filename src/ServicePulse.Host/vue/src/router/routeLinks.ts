const failedMessagesLinks = (root: string) => {
  function createLink(template: string) {
    return { link: `${root}/${template}`, template: template };
  }

  return {
    root,
    failedMessagesGroups: createLink("failed-message-groups"),
    failedMessages: createLink("all-failed-messages"),
    deletedMessagesGroup: createLink("deleted-message-groups"),
    deletedMessages: createLink("all-deleted-messages"),
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
    endpointDetails: { link: (endpointName: string, historyPeriod: number, tab?: string) => `${root}/endpoint/${endpointName}?historyPeriod=${historyPeriod}${(tab && `&tab=${tab}`) ?? ""}`, template: "/monitoring/endpoint/:endpointName" },
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
