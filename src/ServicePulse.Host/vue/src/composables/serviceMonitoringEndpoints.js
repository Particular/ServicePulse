import { ref } from "vue";
import { useFetchFromMonitoring, useIsMonitoringDisabled } from "./serviceServiceControlUrls";
import { monitoringConnectionState } from "../composables/serviceServiceControl";
import { useGetExceptionGroups } from "../composables/serviceMessageGroup.js";

/**
 * @returns the max number of segments in a array of endpoint object names
 */
export function useFindEndpointSegments(endpoints) {
    console.log(endpoints.value);
  if (endpoints.value !== undefined) {
    return endpoints.value.reduce(function (acc, cur) {
      return Math.max(acc, cur.name.split(".").length - 1);
    }, 0);
  }
  return 0;
}

/**
 * @param {Number} - The history period value.  The default is (1)
 * @returns A array of monitoring endpoint objects
 */
export async function useGetAllMonitoredEndpoints(historyPeriod = 1) {
  const endpoints = ref([]);
  if (!useIsMonitoringDisabled() && !monitoringConnectionState.unableToConnect) {
    try {
      const response = await useFetchFromMonitoring(`${`monitored-endpoints`}?history=${historyPeriod}`);
      const data = await response.json();
      endpoints.value = data;
      await addEndpointsFromScSubscription(endpoints);
    } catch (error) {
      console.error(error);
    }
  } else {
    await addEndpointsFromScSubscription(endpoints);
  }
  return endpoints.value;
}

/**
 * @param {String} filterString - The text entered by the user when filtering monitoring endpoints by name
 * @returns A filtered array of monitoring endpoint objects
 */
export function useFilterAllMonitoredEndpointsByName(endpoints, filterString) {
  if (filterString === "") {
    return endpoints.value;
  }
  const filteredEndpoints = endpoints.value.filter((endpoint) => endpoint.name.includes(filterString));
  return filteredEndpoints;
}

/**
 * @param {Array} endpoints - An array of endpoint objects from ServiceControl
 * @param {Number} numberOfSegments - The number of segments to group the array of endpoints by
 * @returns {Array} - An array of grouped endpoint objects
 */
export function useGroupEndpoints(endpoints, numberOfSegments) {
  let groups = new Map();
  if (endpoints.value === undefined) return;
  endpoints.value.forEach(function (element) {
    const grouping = parseEndpoint(element, numberOfSegments);

    let resultGroup = groups.get(grouping.groupName);
    if (!resultGroup) {
      resultGroup = {
        group: grouping.groupName,
        endpoints: [],
      };
      groups.set(grouping.groupName, resultGroup);
    }
    resultGroup.endpoints.push(grouping);
  });
  return [...groups.values()];
}

async function addEndpointsFromScSubscription(endpoints) {
  const exceptionGroups = await useGetExceptionGroups("Endpoint Name");

  //Squash and add to existing monitored endpoints
  if (exceptionGroups.length > 0) {
    //sort the exceptionGroups array by name - case sensitive
    exceptionGroups.sort((a, b) => (a.title > b.title ? 1 : a.title < b.title ? -1 : 0)); //desc
    exceptionGroups.forEach((failedMessageEndpoint) => {
      if (failedMessageEndpoint.operation_status === "ArchiveCompleted") {
        return;
      }
      var index = endpoints.value.findIndex(function (item) {
        return item.name === failedMessageEndpoint.title;
      });
      if (index >= 0) {
        endpoints.value[index].serviceControlId = failedMessageEndpoint.id;
        endpoints.value[index].errorCount = failedMessageEndpoint.count;
      } else {
        var defaultMetricData = {
          points: [],
          average: 0,
        };
        var metricsToAdd = {
          queueLength: defaultMetricData,
          throughput: defaultMetricData,
          retries: defaultMetricData,
          processingTime: defaultMetricData,
          criticalTime: defaultMetricData,
        };
        endpoints.value.push({ name: failedMessageEndpoint.title, errorCount: failedMessageEndpoint.count, serviceControlId: failedMessageEndpoint.id, isScMonitoringDisconnected: true, metrics: metricsToAdd });
      }
    });
  }
}

function parseEndpoint(endpoint, maxGroupSegments) {
  if (maxGroupSegments === 0) {
    return {
      groupName: "Ungrouped",
      shortName: endpoint.name,
      endpoint: endpoint,
    };
  }

  const segments = endpoint.name.split(".");
  const groupSegments = segments.slice(0, maxGroupSegments);
  const endpointSegments = segments.slice(maxGroupSegments);
  if (endpointSegments.length === 0) {
    // the endpoint's name is shorter than the group size
    return parseEndpoint(endpoint, maxGroupSegments - 1);
  }

  return {
    groupName: groupSegments.join("."),
    shortName: endpointSegments.join("."),
    endpoint: endpoint,
  };
}
