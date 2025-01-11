import { screen } from "@testing-library/vue";

export function messageShownWithText(message: string) {
  const statusElements = screen.getAllByRole("status");
  return statusElements.find((el) => el.textContent === message) !== null;
}
