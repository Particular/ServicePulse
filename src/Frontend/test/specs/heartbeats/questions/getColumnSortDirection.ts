import { screen, within } from "@testing-library/vue";

export type ColumnSortDirection = "ascending" | "descending" | "unsorted";

export function getColumnSortDirection(columnName: string): ColumnSortDirection {
  const columnHeader = screen.queryByRole("columnheader", { name: columnName });

  if (!columnHeader) {
    return "unsorted";
  }

  if (within(columnHeader).queryByRole("img", { name: "sort-up" })) {
    return "ascending";
  }

  if (within(columnHeader).queryByRole("img", { name: "sort-down" })) {
    return "descending";
  }

  return "unsorted";
}
