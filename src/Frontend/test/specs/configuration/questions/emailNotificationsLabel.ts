import { screen, waitFor } from "@testing-library/vue";

export async function emailNotificationsLabel() {
  const heading = await screen.findByRole("heading", { name: /Email notifications/i });
  return heading;
}

export async function emailNotificationsToggleLabel() {
  const checkbox = await emailNotificationsToggleCheckBox();
  return checkbox.labels?.[0] as HTMLElement;
}
export async function emailNotificationsToggleCheckBox() {
  const inputId = "onoffswitchemailNotifications";
  return await waitFor(() => document.getElementById(inputId) as HTMLInputElement);
}
