import { parseTimeSpan } from "./formatter";

function getFriendly(time: number, text: string): string {
  return time > 0 ? `${time}${text}` : "";
}

export function getTimeoutFriendly(delivery_delay: string): string {
  const { days, hours, minutes, seconds } = parseTimeSpan(delivery_delay);

  return `${getFriendly(days, "d")}${getFriendly(hours, "h")}${getFriendly(minutes, "m")}${getFriendly(seconds, "s")}`;
}
