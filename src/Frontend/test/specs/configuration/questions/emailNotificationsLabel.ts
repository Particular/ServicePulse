import { screen, waitFor } from "@testing-library/vue";

export async function emailNotificationsLabel() {
  const heading = await screen.findByRole("heading", { name: /Email notifications/i });
  return heading;
}

export async function emailNotificationsToggleLabel() {
  const inputId = "onoffswitchemailNotifications";
  return await waitFor(() => document.querySelector(`label[for="${inputId}"]`) as HTMLElement);
}
export async function emailNotificationsToggleCheckBox() {
  const inputId = "onoffswitchemailNotifications";
  return await waitFor(() => document.querySelector(`input[id="${inputId}"]`) as HTMLInputElement);
}