// Maps each gated UI capability to the ServiceControl HTTP route it represents.
// This is the ONLY place coupling ServicePulse to ServiceControl's route surface:
// the UI gates on routes it already calls, never on the internal permission grammar.
// Paths use {} for each route parameter; matching is param-name-insensitive (see routeMatching.ts).
// Each entry tracks a route in ServiceControl's APIApprovals.HttpApiRoutes (Primary or Monitoring instance).
export type RouteRef = { method: string; path: string };

export const ApiRoutes = {
  // ---- nav / verb-level (GET routes gated by the matching :view permission) ----
  viewHeartbeats:          { method: "GET",    path: "/api/heartbeats/stats" },       // error:heartbeats:view (EndpointsMonitoringController)
  viewMonitoredEndpoints:  { method: "GET",    path: "/api/monitored-endpoints" },     // monitoring:endpoint:view (DiagramApiController, Monitoring instance)
  viewAuditMessages:       { method: "GET",    path: "/api/messages2" },               // error:messages:view (GetMessages2Controller)
  viewFailedMessages:      { method: "GET",    path: "/api/errors" },                  // error:messages:view (GetAllErrorsController)
  viewCustomChecks:        { method: "GET",    path: "/api/customchecks" },            // error:customchecks:view (CustomCheckController)
  viewEventLog:            { method: "GET",    path: "/api/eventlogitems" },           // error:eventlog:view (EventLogApiController)
  viewThroughput:          { method: "GET",    path: "/api/licensing/report/available" }, // error:throughput:view (LicensingController)
  viewLicense:             { method: "GET",    path: "/api/license" },                 // error:licensing:view (LicenseController)
  viewConnections:         { method: "GET",    path: "/api/connection" },              // error:connections:view (ConnectionController)
  viewNotifications:       { method: "GET",    path: "/api/notifications/email" },    // error:notifications:view (NotificationsController)
  viewRedirects:           { method: "GET",    path: "/api/redirects" },              // error:redirects:view (MessageRedirectsController)
  viewEndpoints:           { method: "GET",    path: "/api/endpoints" },              // error:endpoints:view (EndpointsMonitoringController)
  manageThroughput:        { method: "POST",   path: "/api/licensing/settings/masks/update" }, // error:throughput:manage (LicensingController)
  // ---- actions ----
  manageNotifications:     { method: "POST",   path: "/api/notifications/email" },
  testNotifications:       { method: "POST",   path: "/api/notifications/email/test" },
  manageRedirects:         { method: "POST",   path: "/api/redirects" },
  dismissCustomCheck:      { method: "DELETE", path: "/api/customchecks/{}" },
  retryMessage:            { method: "POST",   path: "/api/errors/retry" },
  editMessage:             { method: "POST",   path: "/api/edit/{}" },
  deleteMessage:           { method: "PATCH",  path: "/api/errors/archive" },
  restoreMessage:          { method: "PATCH",  path: "/api/errors/unarchive" },
  retryGroup:              { method: "POST",   path: "/api/recoverability/groups/{}/errors/retry" },
  deleteGroup:             { method: "POST",   path: "/api/recoverability/groups/{}/errors/archive" },
  restoreGroup:            { method: "POST",   path: "/api/recoverability/groups/{}/errors/unarchive" },
  deleteEndpointInstance:  { method: "DELETE", path: "/api/endpoints/{}" },
  deleteMonitoredEndpoint: { method: "DELETE", path: "/api/monitored-instance/{}/{}" },
} as const satisfies Record<string, RouteRef>;
