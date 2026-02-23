import { screen, waitFor, within } from "@testing-library/vue";

export async function configureEmailButton() {
  return await screen.findByRole("button", { name: /configure/i });
}

export async function emailConfigurationPopup() {
  return await waitFor(() => document.querySelector('[role="dialog"][aria-label="Email Configuration"]'));
}

export async function saveButton() {
  return await waitFor(() => document.querySelector('.modal-footer .btn.btn-primary[type="submit"]') as HTMLButtonElement);
}
export async function cancelButton() {
  return await waitFor(() => document.querySelector('.modal-footer .btn.btn-default[type="button"]') as HTMLButtonElement);
}

export async function smtpServerAddressInput() {
  return (await screen.findByRole("textbox", { name: /SMTP server address/i })) as HTMLInputElement;
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
export function emailConfigurationPopupQuery() {
  return screen.queryByRole("dialog", { name: "Email Configuration" });
}
export async function emailConfigurationPopup1() {
  //const dialog = await screen.findByRole("dialog", { name: "Email Configuration" });
  const dialog = await waitFor(() => {
    const el = document.querySelector('[role="dialog"][aria-label="Email Configuration"]');
    if (!el) throw new Error("Dialog not found");
    return el as HTMLElement;
  });

  return {
    dialog, // Expose the dialog element

    saveButton() {
      return within(dialog).getByRole("button", { name: /save/i });
    },

    cancelButton() {
      return within(dialog).getByRole("button", { name: /cancel/i });
    },

    smtpServerAddressInput() {
      return within(dialog).getByRole("textbox", { name: /smtp server address/i }) as HTMLInputElement;
    },
  };
}
