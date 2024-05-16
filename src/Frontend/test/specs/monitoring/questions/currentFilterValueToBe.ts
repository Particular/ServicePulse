import { screen, waitFor } from "@testing-library/vue";

export async function currentFilterValueToBe(filterString: RegExp | string) {
  var htmlElement = await waitFor(()=> screen.findByDisplayValue(filterString));
  return htmlElement!=null;
}
