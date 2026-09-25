import { screen, within } from "@testing-library/vue";

async function serviceControlConnectionSection() {
  const heading = await screen.findByRole("heading", { name: "ServiceControl" });
  const section = heading.closest(".row.connection");

  if (!(section instanceof HTMLElement)) {
    throw new Error("ServiceControl connection section not found");
  }

  return section;
}

async function monitoringConnectionSection() {
  const heading = await screen.findByRole("heading", { name: "ServiceControl Monitoring" });
  const section = heading.closest(".row.connection");

  if (!(section instanceof HTMLElement)) {
    throw new Error("ServiceControl Monitoring connection section not found");
  }

  return section;
}

export async function serviceControlConnectionUrlValue() {
  const section = await serviceControlConnectionSection();
  const input = <HTMLInputElement>within(section).getByRole("textbox", { name: /connection url/i });
  return input.value;
}

export async function monitoringConnectionUrlValue() {
  const section = await monitoringConnectionSection();
  const input = <HTMLInputElement>within(section).getByRole("textbox", { name: /connection url/i });
  return input.value;
}

export async function serviceControlConnectionSuccessfulStatus() {
  const section = await serviceControlConnectionSection();
  return within(section).queryByText("Connection successful");
}

export async function serviceControlConnectionFailedStatus() {
  const section = await serviceControlConnectionSection();
  return within(section).queryByText("Connection failed");
}

export async function monitoringConnectionSuccessfulStatus() {
  const section = await monitoringConnectionSection();
  return within(section).queryByText("Connection successful");
}

export async function monitoringConnectionFailedStatus() {
  const section = await monitoringConnectionSection();
  return within(section).queryByText("Connection failed");
}

export function connectionSavedStatus() {
  return screen.queryByText("Connection saved");
}

export async function monitoringTestButtonDisabled() {
  const section = await monitoringConnectionSection();
  const button = <HTMLButtonElement>within(section).getByRole("button", { name: "Test" });
  return button.disabled;
}

export function monitoringMenuItem() {
  return screen.queryByRole("link", { name: /monitoring/i });
}
