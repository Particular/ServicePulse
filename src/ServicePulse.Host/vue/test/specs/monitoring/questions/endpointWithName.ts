import { screen } from "@testing-library/vue";

/* export async function endpointWithName(endpointName: RegExp | string) {
  return await screen.findByRole("link", { name: endpointName });
} */

export function endpointWithName(endpointName: RegExp | string) {
  return screen.queryByRole("link", { name: endpointName });
}
