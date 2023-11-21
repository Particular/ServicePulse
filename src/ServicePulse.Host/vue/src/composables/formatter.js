import moment from "moment";

const secondDuration = moment.duration(10 * 1000);
const minuteDuration = moment.duration(60 * 1000);
const hourDuration = moment.duration(60 * 1000); //this ensure that we never use minute formatting
const dayDuration = moment.duration(24 * 60 * 60 * 1000);

export function useFormatTime(value) {
  var duration = moment.duration(value);

  var time = { value: 0, unit: "" };
  if (duration >= dayDuration) {
    time.value = formatTimeValue(duration.days()) + " d " + formatTimeValue(duration.hours()) + " hrs";
    return time;
  } else if (duration >= hourDuration) {
    time.value = formatTimeValue(duration.hours(), true) + ":" + formatTimeValue(duration.minutes(), true);
    time.unit = "hr";
    return time;
  } else if (duration >= minuteDuration) {
    time.value = formatTimeValue(duration.minutes()) + ":" + formatTimeValue(duration.seconds());
    time.unit = "min";
    return time;
  } else if (duration >= secondDuration) {
    time.value = formatTimeValue(duration.seconds());
    time.unit = "sec";
    return time;
  } else {
    time.value = formatTimeValue(duration.asMilliseconds());
    time.unit = "ms";
    return time;
  }
}

export function useGetDayDiffFromToday(value) {
  if (!value) return undefined;
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var diff = new Date(value.replace("Z", "")) - today;
  return Math.round(diff / 1000 / 60 / 60 / 24);
}

export function useFormatLargeNumber(value, decimals) {
  var exp,
    suffixes = ["k", "M", "G", "T", "P", "E"];

  value = Number(value);

  if (window.isNaN(value)) {
    return null;
  }

  if (value < 1000000) {
    return round(value, decimals);
  }

  exp = Math.floor(Math.log(value) / Math.log(1000));

  return round(value / Math.pow(1000, exp), decimals) + suffixes[exp - 1];
}

function round(num, decimals) {
  return +(Math.round(num + ("e+" + decimals)) + ("e-" + decimals));
}

function formatTimeValue(timeValue, displayTwoDigits) {
  var strValue = Math.floor(timeValue);
  if (displayTwoDigits) {
    return ("0" + strValue).slice(-2);
  }
  return strValue;
}
