var angular = require('angular');

class ConnectionsStatus {
    constructor(notifyService, $rootScope) {

        var notifier = notifyService();

        notifier.subscribe($rootScope, (event, data) => {
            if (data.isSCConnected !== this.isSCConnected 
                || data.isSCConnecting !== this.isSCConnecting 
                || data.scConnectedAtLeastOnce !== this.scConnectedAtLeastOnce) {

                this.isSCConnected = data.isSCConnected;
                this.isSCConnecting = data.isSCConnecting;
                this.scConnectedAtLeastOnce = data.scConnectedAtLeastOnce;

                notifier.notify('ConnectionsStatusChanged', { status: this });
            }
        }, 'ServiceControlConnectionStatusChanged');

        notifier.subscribe($rootScope, (event, data) => {
            if (data.isMonitoringConnected !== this.isMonitoringConnected
                || data.isMonitoringConnecting !== this.isMonitoringConnecting) {

                this.isMonitoringConnected = data.isMonitoringConnected;
                this.isMonitoringConnecting = data.isMonitoringConnecting;
                
                notifier.notify('ConnectionsStatusChanged', { status: this });
            }
        }, 'MonitoringConnectionStatusChanged');
    }
}

angular.module('configuration')
    .service('connectionsStatus', ['notifyService', '$rootScope', function (notifyService, $rootScope) { 
        return new ConnectionsStatus(notifyService, $rootScope); 
    }]).run(['connectionsStatus', function(connectionsStatus) {
        //make sure the service is initialized as the app starts, otherwise it won't raise notifications unless it's required as dependency
    }]);
