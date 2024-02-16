import { useFormatTime, useFormatLargeNumber } from "../../composables/formatter";

export function formatGraphDuration(input) {
  if (typeof input !== "undefined" && input !== null) {
    let lastValue = input;
    if (input.points) {
      lastValue = input.points.length > 0 ? input.points[input.points.length - 1] : 0;
    }
    return useFormatTime(lastValue);
  }
  return input;
}

export function formatGraphDecimal(input, deci) {
  if (input) {
    let lastValue = input;
    if (input.points) {
      lastValue = input.points.length > 0 ? input.points[input.points.length - 1] : 0;
    }
    let decimals = 0;
    if (lastValue < 10 || input > 1000000) {
      decimals = 2;
    }
    return useFormatLargeNumber(lastValue, deci || decimals);
  } else {
    return 0;
  }
}
