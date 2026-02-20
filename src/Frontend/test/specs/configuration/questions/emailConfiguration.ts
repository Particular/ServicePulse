import { screen, waitFor } from "@testing-library/vue";

export async function configureEmailButton() {
  return await screen.findByRole("button", { name: /configure/i });
}

export async function emailConfigurationPopup() {
  return await waitFor(() => document.querySelector('[role="dialog"][aria-label="Email Configuration"]'));
}

export async function saveButton() {
  return await waitFor(() => document.querySelector('.modal-footer .btn.btn-primary[type="submit"]') as HTMLButtonElement);
}
export async function sendTestNotificationButton() {
  return await screen.findByRole("button", { name: /send test notification/i });
}

export async function testFailedMessage() {
  return await screen.findByText(/test failed/i);
}
export async function testSuccessMessage() {
  return await screen.findByText(/test email sent successfully/i);
}
