(function (angular) {
    "use strict";

    angular.module("monitored_endpoints", [])
        .factory("endpointGrouping", function() {
            return {
                findSegments: function(endpoints) {
                    return endpoints.reduce(function(acc, cur) {
                        return Math.max(acc, cur.name.split(".").length - 1);
                    }, 0);
                },
                group: function (endpoints, numberOfSegments) {
                    var groups = new Map();
                    endpoints.forEach(function(element) {
                        var segments = element.name.split(".");
                        var groupSegments = segments.slice(0, numberOfSegments);
                        var endpointSegments = segments.slice(numberOfSegments);
                        if (endpointSegments.length === 0) {
                            // the endpoint's name is shorter than the group size
                            groupSegments = [];
                            endpointSegments = segments;
                        }

                        var groupName = groupSegments.join(".");
                        if (groupName === "") {
                            groupName = "Others";
                        }

                        var resultGroup = groups.get(groupName);
                        if (!resultGroup) {
                            resultGroup = {
                                group: groupName,
                                endpoints: []
                            }
                            groups.set(groupName, resultGroup);
                        }
                        resultGroup.endpoints.push({
                            shortName: endpointSegments.join("."),
                            endpoint: element
                        });
                    });
                    return [...groups.values()];
                }
            }
        });


})(window.angular);