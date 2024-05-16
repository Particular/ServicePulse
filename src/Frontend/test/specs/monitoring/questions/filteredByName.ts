import { screen, waitFor } from "@testing-library/vue";

export async function filteredByName(filterString: RegExp | string) {
  return await waitFor(()=> screen.findByDisplayValue(filterString));
}
