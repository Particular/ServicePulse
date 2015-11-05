/// <reference path="../../../servicepulse.host/app/lib/jquery/jquery.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/jquery/jquery.signalr-1.1.3.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/angular/angular.js" />
/// <reference path="../../../servicepulse.host/app/lib/angular/angular-route.js" />
/// <reference path="../../../servicepulse.host/app/lib/angular/angular-animate.js" />
/// <reference path="../../../servicepulse.host/app/lib/angular/angular-sanitize.js" />
/// <reference path="../../../servicepulse.host/app/lib/ng-infinite-scroll.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/page-width-functions.js" />
/// <reference path="../../../servicepulse.host/app/lib/zeroclipboard-2.2.0/zeroclipboard.core.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/moment.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/angular/ui-bootstrap-tpls-0.14.3.min.js" />


/// <reference path="../../../servicepulse.host/app/js/app.js" />
/// <reference path="../../../servicepulse.host/app/js/app.constants.js" />
/// <reference path="../../../servicepulse.host/app/js/app.route.js" />
/// <reference path="../../../servicepulse.host/app/js/app.controller.js" />

/// <reference path="../../../servicepulse.host/app/js/services/services.module.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.exception-handler.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.notifications.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.platform-update.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.semver.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.service-control.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.stream.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.uri.js" />

/// <reference path="../../../servicepulse.host/app/js/directives/ngclip.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/moment.js" />

/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.hud.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.productversion.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.confirmclick.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.tabset.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.tab.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.eatclick.js" />

/// <reference path="../../../servicepulse.host/app/js/event_log_items/eventlogitems.js" />

/// <reference path="../../../servicepulse.host/app/js/dashboard/dashboard.module.js" />
/// <reference path="../../../servicepulse.host/app/js/dashboard/dashboard.route.js" />
/// <reference path="../../../servicepulse.host/app/js/dashboard/dashboard.controller.js" />

/// <reference path="../../../servicepulse.host/app/js/failed_messages/failedmessages.module.js" />
/// <reference path="../../../servicepulse.host/app/js/failed_messages/failedmessages.route.js" />
/// <reference path="../../../servicepulse.host/app/js/failed_messages/failedmessages.controller.js" />
/// <reference path="../../../servicepulse.host/app/js/failed_messages/failedmessages.service.js" />

/// <reference path="../../../servicepulse.host/app/js/custom_checks/customchecks.module.js" />
/// <reference path="../../../servicepulse.host/app/js/custom_checks/customchecks.route.js" />
/// <reference path="../../../servicepulse.host/app/js/custom_checks/customchecks.controller.js" />

/// <reference path="../../../servicepulse.host/app/js/endpoints/endpoints.module.js" />
/// <reference path="../../../servicepulse.host/app/js/endpoints/endpoints.route.js" />
/// <reference path="../../../servicepulse.host/app/js/endpoints/endpoints.controller.js" />

/// <reference path="../../../servicepulse.host/app/js/configuration/configuration.module.js" />
/// <reference path="../../../servicepulse.host/app/js/configuration/configuration.route.js" />
/// <reference path="../../../servicepulse.host/app/js/configuration/configuration.controller.js" />

/// <reference path="angular-mocks.js" />


var scConfig = scConfig || {};
scConfig.service_control_url = 'http://localhost:33333/api/';