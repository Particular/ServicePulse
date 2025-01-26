import { screen } from "@testing-library/vue";

export async function licenseExpiryDaysLeft() {
  const licenseExpiryDaysLeft = await screen.findByRole("note", { name: "license-days-left" });
  return licenseExpiryDaysLeft.textContent?.trim;
}
