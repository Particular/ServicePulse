import { screen, within } from "@testing-library/vue";
import UserEvent from "@testing-library/user-event";

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

export async function enterServiceControlConnectionUrl(url: string) {
  const section = await serviceControlConnectionSection();
  const input = <HTMLInputElement>within(section).getByRole("textbox", { name: /connection url/i });
  await UserEvent.clear(input);
  await UserEvent.type(input, url);
}

export async function enterMonitoringConnectionUrl(url: string) {
  const section = await monitoringConnectionSection();
  const input = <HTMLInputElement>within(section).getByRole("textbox", { name: /connection url/i });
  await UserEvent.clear(input);
  await UserEvent.type(input, url);
}

export async function clickServiceControlTest() {
  const section = await serviceControlConnectionSection();
  await UserEvent.click(within(section).getByRole("button", { name: "Test" }));
}

export async function clickMonitoringTest() {
  const section = await monitoringConnectionSection();
  await UserEvent.click(within(section).getByRole("button", { name: "Test" }));
}

export async function clickSaveConnections() {
  await UserEvent.click(await screen.findByRole("button", { name: "Save" }));
}
