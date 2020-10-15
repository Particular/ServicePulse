(function (angular) {
    "use strict";

    angular.module("monitored_endpoints", [])
        .factory("endpointGrouping", function() {
            return {
                group: function (endpoints) {
                    var groups = new Map();
                    endpoints.forEach(function(element) {
                        var segments = element.name.split(".");
                        var last = segments.pop();
                        var group = segments.join(".");
                        if (group === "") {
                            group = "Others";
                        }

                        var resultGroup = groups.get(group);
                        if (!resultGroup) {
                            resultGroup = {
                                group: group,
                                endpoints: []
                            }
                            groups.set(group, resultGroup);
                        }
                        resultGroup.endpoints.push({
                            shortName: last,
                            endpoint: element
                        });
                    });
                    return [...groups.values()];
                }
            }
        });


})(window.angular);