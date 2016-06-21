; (function (window, angular, undefined) {
    'use strict';



    function service($http, $timeout, $q, scConfig, uri, notifications) {

        function sendPromise(url, method, data, success, error) {

            var defer = $q.defer();

            success = success || 'success';
            error = error || 'error';

            $http({
                    url: url,
                    data: data,
                    method: method
                })
                .then(function(response) {
                        defer.resolve({ message: success, status: response.status });
                    }, function(response) {
                        defer.reject({ message: error + ':' + response.statusText, status: response.status, statusText: response.statusText });
                    }
                );

            return defer.promise;
        }

        return {
           
            createRedirect: function (sourceEndpoint, targetEndpoint, success, error) {
                var url = uri.join(scConfig.service_control_url, 'redirects');
                return sendPromise(url, 'POST', { "fromphysicaladdress": sourceEndpoint, "tophysicaladdress": targetEndpoint }, success, error);
            },
            updateRedirect: function (redirectId, sourceEndpoint, targetEndpoint, success, error) {
                var url = uri.join(scConfig.service_control_url, 'redirects', redirectId);
                return sendPromise(url, 'PUT', { "id": redirectId, "fromphysicaladdress": sourceEndpoint, "tophysicaladdress": targetEndpoint }, success, error);
            },
            deleteRedirect: function (id, success, error) {
                var url = uri.join(scConfig.service_control_url, 'redirects', id);
                return $http.delete(url)
                    .success(function() {
                        notifications.pushForCurrentRoute(success, 'info');
                    })
                    .error(function () {
                        notifications.pushForCurrentRoute(error, 'danger');
                });
            },
            getTotalRedirects: function() {
                var url = uri.join(scConfig.service_control_url, 'redirects');
                return $http.head(url).then(function(response) {
                    return response.headers('Total-Count');
                });
            },
            getRedirects: function() {
                var url = uri.join(scConfig.service_control_url, 'redirects');
                return $http.get(url).then(function(response) {
                    return {
                        data: response.data,
                        total: response.headers('Total-Count')
                    };
                });
            },
            displayCreateRedirectModal: function () {
                displayEditModal("Create Redirect", "Create", "Redirect was created successfully", "Failed to create redirect.");
            },
            displayEditRedirectModal: function (redirect) {
                displayEditModal("Modify Redirect", "Modify", "Redirect was updated successfully", "Failed to update redirect.", redirect);
            },
            displayRedirectModal: function (title, saveButtonText, success, failure, redirect) {
                $uibModal.open({
                    templateUrl: 'js/views/redirect/edit/view.html',
                    controller: 'editRedirectController',
                    resolve: {
                        data: function () {
                            return {
                                redirect: redirect,
                                title: title,
                                saveButtonText: saveButtonText,
                                success: success,
                                failure: failure
                            };
                        }
                    }
                }).result.then(function () {
                    refreshData();
                });
            },



        };
    }

    service.$inject = ['$http', '$timeout', '$q', 'scConfig', 'uri', 'notifications'];

    angular.module('sc')
        .service('redirectService', service);

})(window, window.angular);