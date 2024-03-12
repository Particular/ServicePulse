import GroupOperation from "./GroupOperation";

export type GroupPropertyType = string | number | Date;

export default interface SortOptions {
  description: string;
  icon: string;
  dir?: SortDirection;
  //used for client-side sorting only
  selector?: (group: GroupOperation) => GroupPropertyType;
  sort?: (firstElement: GroupOperation, secondElement: GroupOperation) => number;
}

export enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}
