angular.module('services.notifications', []).factory('notifications', ['$rootScope', '$interpolate', function ($rootScope, $interpolate) {

  var notifications = {
    'STICKY' : [],
    'ROUTE_CURRENT' : [],
    'ROUTE_NEXT' : []
  };
  var notificationsService = {};

  var addNotification = function (notificationsArray, notificationObj) {
    if (!angular.isObject(notificationObj)) {
      throw new Error("Only object can be added to the notification service");
    }
    notificationsArray.push(notificationObj);
    return notificationObj;
  };
    
  var prepareNotification = function (message, type, interpolateParams, otherProperties) {
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

  notificationsService.getCurrent = function(){
    return [].concat(notifications.STICKY, notifications.ROUTE_CURRENT);
  };
    
  notificationsService.pushSticky = function(message, type, interpolateParams, otherProperties) {
      return addNotification(notifications.STICKY, prepareNotification(message, type, interpolateParams, otherProperties));
  };

  notificationsService.pushForCurrentRoute = function(message, type, interpolateParams, otherProperties) {
        return addNotification(notifications.ROUTE_CURRENT, prepareNotification(message, type, interpolateParams, otherProperties));
  };

  notificationsService.pushForNextRoute = function(message, type, interpolateParams, otherProperties) {
        return addNotification(notifications.ROUTE_NEXT, prepareNotification(message, type, interpolateParams, otherProperties));
  };

  notificationsService.remove = function(notification){
    angular.forEach(notifications, function (notificationsByType) {
      var idx = notificationsByType.indexOf(notification);
      if (idx>-1){
        notificationsByType.splice(idx,1);
      }
    });
  };

  notificationsService.removeAll = function(){
    angular.forEach(notifications, function (notificationsByType) {
      notificationsByType.length = 0;
    });
  };

  return notificationsService;
}]);