import { timingSafeEqual } from "crypto";

class ConnectionsStatus {
    constructor(notifyService, $rootScope) {
        var notifier = notifyService();

        notifier.subscribe($rootScope, (event, data) => {
            if(data.isSCConnected !== this.isSCConnected 
                || data.isSCConnecting !== this.isSCConnecting 
                || data.scConnectedAtLeastOnce !== this.scConnectedAtLeastOnce){
                
                this.isSCConnected = data.isSCConnected;
                this.isSCConnecting = data.isSCConnecting;
                this.scConnectedAtLeastOnce = data.scConnectedAtLeastOnce;

                notifier.notify('ConnectionsStatusChanged', {});
            }
        }, 'ServiceControlConnectionStatusChanged');

        notifier.subscribe($rootScope, (event, data) => {
            if(data.isMonitoringConnected !== this.isMonitoringConnected){
                this.isMonitoringConnected = data.isMonitoringConnected;
                notifier.notify('ConnectionsStatusChanged', {});
            }
        }, 'MonitoringConnectionStatusChanged');
    }
}

angular.module('configuration')
    .service('connectionsStatus', ['notifyService', '$rootScope', function (notifyService, $rootScope) { 
        return new ConnectionsStatus(notifyService, $rootScope); 
    }]);