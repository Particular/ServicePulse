import dayjs from "@/utils/dayjs";

const secondDuration = dayjs.duration(1000);
const minuteDuration = dayjs.duration(60 * 1000);
const hourDuration = dayjs.duration(60 * 60 * 1000); //this ensures that we never use minute formatting
const dayDuration = dayjs.duration(24 * 60 * 60 * 1000);

export interface ValueWithUnit {
  value: string;
  unit: string;
}

export function createDateWithDayOffset(daysOffset: number = 0): Date {
  const date = new Date();
  if (daysOffset !== 0) {
    date.setDate(date.getDate() + daysOffset);
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

export function useFormatTime(value?: number): ValueWithUnit {
  const time = { value: "0", unit: "ms" };
  if (value) {
    const duration = dayjs.duration(value);
    if (duration >= dayDuration) {
      time.value = formatTimeValue(duration.days()) + " d " + formatTimeValue(duration.hours()) + " hrs";
    } else if (duration >= hourDuration) {
      time.value = formatTimeValue(duration.hours(), true) + ":" + formatTimeValue(duration.minutes(), true);
      time.unit = "hr";
    } else if (duration >= minuteDuration) {
      time.value = formatTimeValue(duration.minutes()) + ":" + formatTimeValue(duration.seconds());
      time.unit = "min";
    } else if (duration >= secondDuration) {
      time.value = formatTimeValue(duration.seconds());
      time.unit = "sec";
    } else {
      time.value = formatTimeValue(duration.asMilliseconds());
      time.unit = "ms";
    }
  }

  return time;
}

export function useGetDayDiffFromToday(value: string) {
  const today = createDateWithDayOffset();
  const inputDate = new Date(value.replace("Z", ""));
  const diff = inputDate.getTime() - today.getTime();
  const days = Math.round(diff / 1000 / 60 / 60 / 24);
  // Ensure we don't return -0
  return days === 0 ? 0 : days;
}

export function useFormatLargeNumber(num: number, decimals: number) {
  const suffixes = ["k", "M", "G", "T", "P", "E"];

  if (isNaN(num)) {
    return "";
  }

  if (num < 1000000) {
    return round(num, decimals).toLocaleString();
  }

  const exp = Math.floor(Math.log(num) / Math.log(1000));

  return `${round(num / Math.pow(1000, exp), decimals).toLocaleString()}${suffixes[exp - 1]}`;
}

function round(num: number, decimals: number) {
  return Number(num.toFixed(decimals));
}

function formatTimeValue(timeValue: number, displayTwoDigits = false) {
  const strValue = Math.floor(timeValue);
  return `${displayTwoDigits ? ("0" + strValue).slice(-2) : strValue.toLocaleString()}`;
}

export function parseTimeSpan(timeSpan: string) {
  // Split on period first to handle multi-digit days
  const parts = timeSpan.split(".");
  let days = 0;
  let timeComponent = timeSpan;

  if (parts.length > 1) {
    days = parseInt(parts[0], 10);
    timeComponent = parts[1];
  }

  const [hours, minutes, seconds] = timeComponent.split(":").map(Number);
  return { days, hours, minutes, seconds };
}

export function timeSpanToDuration(timeSpan: string | undefined) {
  if (!timeSpan) return dayjs.duration("PT0S");

  return dayjs.duration(parseTimeSpan(timeSpan));
}
