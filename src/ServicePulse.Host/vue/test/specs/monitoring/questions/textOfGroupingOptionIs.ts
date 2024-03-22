import { screen } from "@testing-library/vue";

export default async function textOfGroupingOptionIs(optionText: RegExp | string) {
  return await screen.findByRole("link", { name: optionText });
}
