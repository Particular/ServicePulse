export type GroupPropertyType = string | number | Date;

export default interface SortOptions<T> {
  description: string;
  icon: string;
  dir?: SortDirection;
  //used for client-side sorting only
  selector?: (group: T) => GroupPropertyType;
  sort?: (firstElement: T, secondElement: T) => number;
}

export enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}
