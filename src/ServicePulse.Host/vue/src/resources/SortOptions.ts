export type GroupValue = string | number | Date;

export default interface SortOptions {
  description: string;
  dir: string;
  selector: (group: GroupValue) => GroupValue;
  icon: string;
  sort: (firstElement: GroupValue, secondElement: GroupValue) => number;
}
