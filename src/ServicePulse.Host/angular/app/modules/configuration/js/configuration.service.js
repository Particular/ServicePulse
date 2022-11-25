var angular = require('angular');

class ConfigurationService {
    constructor($http, $q, connectionsManager, uri) {
        this.scu = connectionsManager.getServiceControlUrl();
        this.$http = $http;
        this.$q = $q;
        this.uri = uri;
    }

    patchPromise(url, data, success, error) {
        var defer = this.$q.defer();

        success = success || 'success';
        error = error || 'error';

        this.$http({
                url: url,
                data: data,
                method: 'PATCH'
            })
            .then(function (response) {
                defer.resolve(success + ':' + response);
            }, function (response, status) {
                if (status === '304' || status === 304) {
                    defer.resolve(success + ':' + response);
                } else {
                    defer.reject(error + ':' + response);
                }
            });

        return defer.promise;
    }

    getEndpoints() {
        var url = this.uri.join(this.scu, 'endpoints');
        return this.$http.get(url).then(function (response) {
            return {
                data: response.data
            };
        });
    }

    update(id, newState, success, error) {
        var url = this.uri.join(this.scu, 'endpoints', id);
        return this.patchPromise(url, { "monitor_heartbeat": newState }, success, error);
    }

    isEndpointDeleteSupported() {
        var url = this.uri.join(this.scu, 'endpoints');
        return this.$http({
            method: 'OPTIONS',
            url
        }).then((response) => {
            let headers = response.headers();

            let allow = headers.allow;
            if (!headers.allow) {
                return false;
            }

            let deleteAllowed = allow.indexOf(`DELETE`) >= 0;

            return deleteAllowed;
        }, function(error) {
            return false;
        });
    }

    deleteEndpoint(endpointId) {
        var url = this.uri.join(this.scu, 'endpoints', endpointId);
        return this.$http.delete(url);
    }
}

angular.module('configuration.service', [])
.factory('configurationService', ['$http', '$q', 'connectionsManager', 'uri', function ($http, $q, connectionsManager, uri) { 
    return new ConfigurationService($http, $q, connectionsManager, uri); 
}]);