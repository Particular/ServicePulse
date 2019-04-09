class ConnectionsStatus {
    constructor(notifyService, $rootScope) {
        var notifier = notifyService();

        notifier.subscribe($rootScope, (event, data) => {
            this.isSCConnected = data.isSCConnected;
            this.isSCConnecting = data.isSCConnecting;
            this.scConnectedAtLeastOnce = data.scConnectedAtLeastOnce;

            console.warn('ConnectionsStatus::ServiceControlConnectionStatusChanged', data);

            notifier.notify('ConnectionsStatusChanged', {});

        }, 'ServiceControlConnectionStatusChanged');

        notifier.subscribe($rootScope, (event, data) => {
            this.isMonitoringConnected = data.isMonitoringConnected;

            console.warn('ConnectionsStatus::MonitoringConnectionStatusChanged', data);

            notifier.notify('ConnectionsStatusChanged', {});

        }, 'MonitoringConnectionStatusChanged');
    }
}

angular.module('configuration')
    .service('connectionsStatus', ['notifyService', '$rootScope', function (notifyService, $rootScope) { 
        return new ConnectionsStatus(notifyService, $rootScope); 
    }]);