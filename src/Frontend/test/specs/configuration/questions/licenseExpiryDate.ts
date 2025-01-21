import { screen } from "@testing-library/vue";

export async function licenseExpiryDate() {
  const licenseExpiryDate = await screen.findByRole("note", { name: "licenseExpiryDate" });
  console.log(licenseExpiryDate.textContent);
  return licenseExpiryDate.textContent;
}
