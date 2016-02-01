
; (function (window, angular, undefined) {
    'use strict';

    function Service($rootScope, $interpolate,  toastr) {

        var notifications = {
            'STICKY': [],
            'ROUTE_CURRENT': [],
            'ROUTE_NEXT': []
        };


        function success(message, title) {
            toastr.success(message, title || 'Success');
        }

        function info(message, title) {
            toastr.info(message, title || 'Information');
        }
        
        function warning(message, title) {
            toastr.warning(message, title || 'Warning');
        }

        function error(message, title) {
            toastr.error(message, title || 'Error');
        }

        function addNotification(notificationsArray, notificationObj) {
            
            if (!angular.isObject(notificationObj)) {
                throw new Error('Only object can be added to the notification service');
            }
            
            notificationsArray.push(notificationObj);
            return notificationObj;
        };

        function prepareNotification(message, type, interpolateParams, otherProperties) {
            return angular.extend({
                message: $interpolate(message)(interpolateParams),
                type: type
            }, otherProperties);
        };

        $rootScope.$on('$routeChangeSuccess', function () {
            notifications.ROUTE_CURRENT.length = 0;
            notifications.ROUTE_CURRENT = angular.copy(notifications.ROUTE_NEXT);
            notifications.ROUTE_NEXT.length = 0;
        });

        function getCurrent() {
            return [].concat(notifications.STICKY, notifications.ROUTE_CURRENT);
        };

        function pushSticky(message, type, interpolateParams, otherProperties) {
            return addNotification(notifications.STICKY, angular.extend(prepareNotification(message, type, interpolateParams, otherProperties), { disableClosing: true }));
        };

        function pushForCurrentRoute(message, type, interpolateParams, otherProperties) {
            return addNotification(notifications.ROUTE_CURRENT, prepareNotification(message, type, interpolateParams, otherProperties));
        };

        function pushForNextRoute(message, type, interpolateParams, otherProperties) {
            return addNotification(notifications.ROUTE_NEXT, prepareNotification(message, type, interpolateParams, otherProperties));
        };

        function remove(notification) {

            angular.forEach(notifications, function (notificationsByType) {

                var idx = notificationsByType.indexOf(notification);

                if (idx > -1) {
                    notificationsByType.splice(idx, 1);
                }

            });
        };

        function removeByText(text) {

            var self = this;

            var prevNotifications = self.getCurrent().filter(function (notification) {
                return notification.message === text;
            });

            prevNotifications.forEach(function (notification) {
                self.remove(notification);
            });

        };

        function removeAll() {

            angular.forEach(notifications, function (notificationsByType) {

                notificationsByType.length = 0;

            });
        };

        var service = {
            getCurrent: getCurrent,
            pushSticky: pushSticky,
            pushForCurrentRoute: pushForCurrentRoute,
            pushForNextRoute: pushForNextRoute,
            remove: remove,
            removeByText: removeByText,
            removeAll: removeAll,
            // ------ toastr
            success: success,
            info: info,
            warning: warning,
            error: error
        };

        return service;
    }

    Service.$inject = ['$rootScope', '$interpolate', 'toastr'];

    angular.module('services.notifications', [])
        .factory('notifications', Service);

} (window, window.angular));