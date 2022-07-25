(function (angular) {
    "use strict";

    function parseEndpoint(endpoint, maxGroupSegments) {

        if (maxGroupSegments === 0) {
            return {
                groupName: "Ungrouped",
                shortName: endpoint.name,
                endpoint: endpoint
        }
        }

        var segments = endpoint.name.split(".");
        var groupSegments = segments.slice(0, maxGroupSegments);
        var endpointSegments = segments.slice(maxGroupSegments);
        if (endpointSegments.length === 0) {
            // the endpoint's name is shorter than the group size
            return parseEndpoint(endpoint, maxGroupSegments - 1);
        }

        return {
            groupName: groupSegments.join("."),
            shortName: endpointSegments.join("."),
            endpoint: endpoint
        };
    }

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
                        var grouping = parseEndpoint(element, numberOfSegments);

                        var resultGroup = groups.get(grouping.groupName);
                        if (!resultGroup) {
                            resultGroup = {
                                group: grouping.groupName,
                                endpoints: []
                            }
                            groups.set(grouping.groupName, resultGroup);
                        }
                        resultGroup.endpoints.push(grouping);
                    });
                    return [...groups.values()];
                }
            }
        });


})(window.angular);