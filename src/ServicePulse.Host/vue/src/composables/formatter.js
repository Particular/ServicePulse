import moment from "moment";

const secondDuration = moment.duration(10 * 1000);
const minuteDuration = moment.duration(60 * 1000);
const hourDuration = moment.duration(60 * 1000); //this ensure that we never use minute formatting
const dayDuration = moment.duration(24 * 60 * 60 * 1000);

export function useFormatTime(value) {
  const duration = moment.duration(value);

  const time = { value: 0, unit: "" };
  if (duration >= dayDuration) {
    time.value = duration.format("D [d] h [hr]");
    return time;
  } else if (duration >= hourDuration) {
    time.value = moment.utc(duration.asMilliseconds()).format("HH:mm");
    time.unit = "hr";
    return time;
  } else if (duration >= minuteDuration) {
    time.value = duration.format("mm:ss");
    time.unit = "min";
    return time;
  } else if (duration >= secondDuration) {
    time.value = duration.format("ss");
    time.unit = "sec";
    return time;
  } else {
    time.value = duration.format("s,SSS");
    time.unit = "ms";
    return time;
  }
}

export function useGetDayDiffFromToday(value) {
  if (!value) return undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = new Date(value.replace("Z", "")) - today;
  return Math.round(diff / 1000 / 60 / 60 / 24);
}

export function useFormatLargeNumber(value, decimals) {
  let exp,
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
