import { screen, waitFor } from "@testing-library/vue";

// Returns the "Configure" button for email notifications
export async function configureEmailButton() {
  return await screen.findByRole("button", { name: /configure/i });
}

// Returns the email configuration popup/modal
export async function emailConfigurationPopup() {
  return await waitFor(() => document.querySelector('[role="dialog"][aria-label="Email Configuration"]'));
}

export async function saveButton() {
  return await waitFor(() => document.querySelector('.modal-footer .btn.btn-primary[type="submit"]') as HTMLButtonElement);
}
