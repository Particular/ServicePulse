import { screen } from "@testing-library/vue";

export function sortUpArrow() {
  return screen.queryByLabelText("sort-up");
}

export function sortDownArrow() {
  return screen.queryByLabelText("sort-down");
}
