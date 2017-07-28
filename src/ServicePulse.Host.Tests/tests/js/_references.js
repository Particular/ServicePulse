﻿/// <!-- Vendor -->
/// <reference path="../../../servicepulse.host/app/lib/jQuery/jquery.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/jQuery/jquery.signalR-1.1.3.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/angular/angular.js" />
/// <reference path="../../../servicepulse.host/app/lib/angular/angular-route.js" />
/// <reference path="../../../servicepulse.host/app/lib/angular/angular-animate.js" />
/// <reference path="../../../servicepulse.host/app/lib/angular/angular-sanitize.js" />
/// <reference path="../../../servicepulse.host/app/lib/angular/ngStorage.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/angular/ng-page-title.js" />
/// <reference path="../../../servicepulse.host/app/lib/toaster.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/ng-infinite-scroll.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/bootstrap-3.3.5/js/bootstrap.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/angular/ui-bootstrap-tpls-0.14.3.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/page-width-functions.js" />
/// <reference path="../../../servicepulse.host/app/lib/zeroclipboard-2.2.0/ZeroClipboard.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/moment.min.js" />
/// <reference path="../../../servicepulse.host/app/lib/angular/angular-momentjs.js" />
/// <!-- App -->
/// <reference path="../../../servicepulse.host/app/js/app.js" />
/// <reference path="../../../servicepulse.host/app/js/app.constants.js" />
/// <reference path="../../../servicepulse.host/app/js/app.route.js" />
/// <reference path="../../../servicepulse.host/app/js/app.controller.js" />
/// <reference path="../../../servicepulse.host/app/js/app.logging.js" />
/// <reference path="../../../servicepulse.host/app/js/app.http.js" />
/// <!-- Services -->
/// <reference path="../../../servicepulse.host/app/js/services/services.module.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.exception-handler.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.notifications.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.platform-update.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.semver.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.service-control.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.stream.js" />
/// <reference path="../../../servicepulse.host/app/js/services/services.uri.js" />
/// <reference path="../../../servicepulse.host/app/js/services/service.toast.js" />
/// <reference path="../../../servicepulse.host/app/js/services/factory.listener.js" />
/// <reference path="../../../servicepulse.host/app/js/services/factory.notifier.js" />
/// <reference path="../../../servicepulse.host/app/js/services/factory.shareddata.js" />
/// <reference path="../../../servicepulse.host/app/js/services/factory.rxjs.js" />
/// <!-- Directives -->
/// <reference path="../../../servicepulse.host/app/js/directives/ngClip.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/moment.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.hud.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.productVersion.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.busy.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.nodata.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.confirmclick.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.tabset.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.tab.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.eatclick.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.failedMessageTabs.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.configurationTabs.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.largenumber.js" />
/// <reference path="../../../servicepulse.host/app/js/directives/ui.particular.historicalPeriodChooser.js" />
/// <!-- Mystery -->
/// <reference path="../../../servicepulse.host/app/js/views/event_log_items/eventLogItems.js" />
/// <!-- Archive -->
/// <reference path="../../../servicepulse.host/app/js/views/about/route.js" />
/// <reference path="../../../servicepulse.host/app/js/views/about/controller.js" />
/// <!-- Dashboard -->
/// <reference path="../../../servicepulse.host/app/js/views/dashboard/dashboard.module.js" />
/// <reference path="../../../servicepulse.host/app/js/views/dashboard/dashboard.route.js" />
/// <reference path="../../../servicepulse.host/app/js/views/dashboard/dashboard.controller.js" />
/// <!-- Failed Groups -->
/// <reference path="../../../servicepulse.host/app/js/views/failed_groups/route.js" />
/// <reference path="../../../servicepulse.host/app/js/views/failed_groups/controller.js" />
/// <reference path="../../../servicepulse.host/app/js/views/failed_groups/service.js" />
/// <!-- Failed Messages -->
/// <reference path="../../../servicepulse.host/app/js/views/failed_messages/route.js" />
/// <reference path="../../../servicepulse.host/app/js/views/failed_messages/controller.js" />
/// <reference path="../../../servicepulse.host/app/js/views/failed_messages/service.js" />
/// <!-- Archive -->
/// <reference path="../../../servicepulse.host/app/js/views/archive/route.js" />
/// <reference path="../../../servicepulse.host/app/js/views/archive/controller.js" />
/// <reference path="../../../servicepulse.host/app/js/views/archive/service.js" />
/// <!-- Custom Checks -->
/// <reference path="../../../servicepulse.host/app/js/views/custom_checks/customChecks.module.js" />
/// <reference path="../../../servicepulse.host/app/js/views/custom_checks/customChecks.route.js" />
/// <reference path="../../../servicepulse.host/app/js/views/custom_checks/customChecks.controller.js" />
/// <!-- Endpoints -->
/// <reference path="../../../servicepulse.host/app/js/views/endpoints/endpoints.module.js" />
/// <reference path="../../../servicepulse.host/app/js/views/endpoints/endpoints.route.js" />
/// <reference path="../../../servicepulse.host/app/js/views/endpoints/endpoints.controller.js" />
/// <!-- Configuration -->
/// <reference path="../../../servicepulse.host/app/js/views/configuration/configuration.module.js" />
/// <reference path="../../../servicepulse.host/app/js/views/configuration/configuration.route.js" />
/// <reference path="../../../servicepulse.host/app/js/views/configuration/configuration.controller.js" />
/// <reference path="../../../servicepulse.host/app/js/views/configuration/configuration.service.js" />
/// <!-- Redirects -->
/// <reference path="../../../servicepulse.host/app/js/views/redirect/controller.js" />
/// <reference path="../../../servicepulse.host/app/js/views/redirect/route.js" />
/// <reference path="../../../servicepulse.host/app/js/views/redirect/service.js" />
/// <reference path="../../../servicepulse.host/app/js/views/redirect/edit/controller.js" />
/// <!-- Message -->
/// <reference path="../../../servicepulse.host/app/js/views/message/controller.js" />
/// <reference path="../../../servicepulse.host/app/js/views/message/route.js" />

/// <reference path="angular-mocks.js" />