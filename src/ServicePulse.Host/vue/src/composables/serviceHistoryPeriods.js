import { useCookies } from "vue3-cookies";

const cookies = useCookies().cookies;
const periods = [
  { pVal: 1, text: "1m", refreshInterval: 1 * 1000, refreshIntervalText: "Show data from the last minute. Refreshes every 1 second" },
  { pVal: 5, text: "5m", refreshInterval: 5 * 1000, refreshIntervalText: "Show data from the last 5 minutes. Refreshes every 5 seconds" },
  { pVal: 10, text: "10m", refreshInterval: 10 * 1000, refreshIntervalText: "Show data from the last 10 minutes. Refreshes every 10 seconds" },
  { pVal: 15, text: "15m", refreshInterval: 15 * 1000, refreshIntervalText: "Show data from the last 15 minutes. Refreshes every 15 seconds" },
  { pVal: 30, text: "30m", refreshInterval: 30 * 1000, refreshIntervalText: "Show data from the last 30 minutes. Refreshes every 30 seconds" },
  { pVal: 60, text: "1h", refreshInterval: 60 * 1000, refreshIntervalText: "Show data from the last hour. Refreshes every 1 minute" },
];

/**
 * @param {Object} period - A history period object
 * @description - Saves a history period object to a cookie
 */
export function saveSelectedPeriod(period) {
  cookies.set(`history_period`, period.pVal);
}

/**
 * @returns - An array of all the history period objects
 */
export function useGetAllPeriods() {
  return periods;
}

/**
 * @param {Object} route - The route object by using useRoute() from the vue-router dependency
 * @returns - The saved cookie period object or the default period object (1m)
 */
export function useGetDefaultPeriod(route) {
  let defaultPeriod = useHistoryPeriodQueryString(route);
  if (defaultPeriod === undefined) {
    const storedPeriodValue = cookies.get("history_period");
    const storedPeriod =
      periods[
        periods.findIndex((period) => {
          return period.pVal == storedPeriodValue;
        })
      ];

    if (typeof storedPeriodValue !== "undefined" && typeof storedPeriod !== "undefined") {
      defaultPeriod = storedPeriod;
    } else {
      defaultPeriod = periods[0];
    }
  }

  return defaultPeriod;
}

function useHistoryPeriodQueryString(route) {
  const queryParameters = { ...route.query };

  if (queryParameters.historyPeriod !== undefined && !isNaN(queryParameters.historyPeriod)) {
    const historyPeriodParam = parseInt(route.query.historyPeriod);
    const foundHistoryPeriod = periods.find((period) => {
      return period.pVal === historyPeriodParam;
    });
    if (foundHistoryPeriod !== undefined) {
      return foundHistoryPeriod;
    }
  }
  return undefined;
}
