import FailedMessage from "./FailedMessage";
import FailureGroup from "./FailureGroup";

export type GroupType = FailedMessage | FailureGroup;
export type GroupPropertyType = string | number | Date;

export default interface SortOptions {
  description: string;
  dir: string;
  selector: (group: GroupType) => GroupPropertyType;
  icon: string;
  sort: (firstElement: GroupType, secondElement: GroupType) => number;
}

export enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}
