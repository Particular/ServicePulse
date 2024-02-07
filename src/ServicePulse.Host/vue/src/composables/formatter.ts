import moment from "moment";

const secondDuration = moment.duration(10 * 1000);
const minuteDuration = moment.duration(60 * 1000);
const hourDuration = moment.duration(60 * 1000); //this ensures that we never use minute formatting
const dayDuration = moment.duration(24 * 60 * 60 * 1000);

export function useFormatTime(value: string) {
  const duration = moment.duration(value);
  const time = { value: "0", unit: "" };
  const asUtc = moment.utc(duration.asMilliseconds());

  if (duration >= dayDuration) {
    time.value = asUtc.format("D [d] h [hr]");
  } else if (duration >= hourDuration) {
    time.value = asUtc.format("HH:mm");
    time.unit = "hr";
  } else if (duration >= minuteDuration) {
    time.value = asUtc.format("mm:ss");
    time.unit = "min";
  } else if (duration >= secondDuration) {
    time.value = asUtc.format("ss");
    time.unit = "sec";
  } else {
    time.value = asUtc.format("s,SSS");
    time.unit = "ms";
  }

  return time;
}

export function useGetDayDiffFromToday(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = new Date(value.replace("Z", "")).getTime() - today.getTime();
  return Math.round(diff / 1000 / 60 / 60 / 24);
}

export function useFormatLargeNumber(value: string, decimals: number) {
  const suffixes = ["k", "M", "G", "T", "P", "E"];

  const num = Number(value);

  if (isNaN(num)) {
    return null;
  }

  if (num < 1000000) {
    return round(num, decimals);
  }

  const exp = Math.floor(Math.log(num) / Math.log(1000));

  return round(num / Math.pow(1000, exp), decimals) + suffixes[exp - 1];
}

function round(num: number, decimals: number) {
  return Math.round(num + Number(`e+${decimals}`)) + Number(`e-${decimals}`);
}
