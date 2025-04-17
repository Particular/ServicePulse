import { useFormatTime } from "@/composables/formatter";

export function friendlyTypeName(messageType: string) {
  if (messageType == null) return undefined;

  const typeClass = messageType.split(",")[0];
  const typeName = typeClass.split(".").reverse()[0];
  return typeName.replace(/\+/g, ".");
}

export function formatDotNetTimespan(timespan: string) {
  //assuming if we have days in the timespan then something is very, very wrong
  const [hh, mm, ss] = timespan.split(":");
  const time = useFormatTime(((parseInt(hh) * 60 + parseInt(mm)) * 60 + parseFloat(ss)) * 1000);
  return `${time.value} ${time.unit}`;
}
