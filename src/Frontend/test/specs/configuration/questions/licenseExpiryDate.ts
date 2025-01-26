import { screen } from "@testing-library/vue";

export async function licenseExpiryDate() {
  const licenseExpiryDate = await screen.findByRole("note", { name: "license-expiry-date" });
  return licenseExpiryDate.textContent?.trim;
}
