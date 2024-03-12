import FailedMessage from "./FailedMessage";
import FailureGroup from "./FailureGroup";

export type GroupType = FailedMessage | FailureGroup;
export type GroupPropertyType = string | number | Date;

export default interface SortOptions {
  description: string;
  icon: string;
  dir?: SortDirection;
  //used for client-side sorting only
  selector?: (group: GroupType) => GroupPropertyType;
  sort?: (firstElement: GroupType, secondElement: GroupType) => number;
}

export enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}
