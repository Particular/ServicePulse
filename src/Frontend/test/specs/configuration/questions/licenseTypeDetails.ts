import { screen } from "@testing-library/vue";

export async function licenseTypeDetails() {
  const licenseType = await screen.findByRole("displayText", { name: "license-type" });
  return licenseType.textContent;
}
