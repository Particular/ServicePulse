import { useFormatTime } from "@/composables/formatter.ts";

export function formatTypeName(type: string) {
  const clazz = type.split(",")[0];
  return clazz;
}

export function formatDotNetTimespan(timespan: string) {
  //assuming if we have days in the timespan then something is very, very wrong
  const [hh, mm, ss] = timespan.split(":");
  const time = useFormatTime(((parseInt(hh) * 60 + parseInt(mm)) * 60 + parseFloat(ss)) * 1000);
  return `${time.value} ${time.unit}`;
}
