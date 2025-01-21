import { screen } from "@testing-library/vue";

export async function licenseExpiryDaysLeft() {
  const licenseExpiryDaysLeft = await screen.findByRole("note", { name: "licenseExpiryDaysLeft" });
  console.log(licenseExpiryDaysLeft.textContent);
  return licenseExpiryDaysLeft.textContent;
}
