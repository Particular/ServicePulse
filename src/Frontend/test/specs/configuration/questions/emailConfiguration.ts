import { screen, waitFor } from "@testing-library/vue";

// Returns the "Configure" button for email notifications
export async function getConfigureEmailButton() {
  return await screen.findByRole("button", { name: /configure/i });
}

// Returns the email configuration popup/modal
export async function getEmailConfigurationPopup() { 
  return await waitFor(() => document.querySelector('[role="dialog"][aria-label="Email Configuration"]'));
}

export async function getSaveButton() {
  return await waitFor(() =>
    document.querySelector('.modal-footer .btn.btn-primary[type="submit"]') as HTMLButtonElement
  );
}