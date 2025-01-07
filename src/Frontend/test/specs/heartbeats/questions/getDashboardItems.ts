import { screen, within } from "@testing-library/vue";

export interface DashboardItemData {
  name: string;
  isCounterVisible: boolean;
  counterValue: number;
  dashboardItem: HTMLElement;
}

export async function getDashboardItems() {
  const dashboardItems = await screen.findAllByRole("dashboard-item");

  return new Map<string, DashboardItemData>(
    dashboardItems.map((di) => {
      const nameHeading = within(di).getByRole("heading");
      const name = String(nameHeading.textContent);
      const counterElement = within(di).queryByRole("counter");

      return [
        name,
        {
          name: name,
          isCounterVisible: counterElement !== null,
          counterValue: counterElement ? Number(counterElement.innerText) : 0,
          dashboardItem: di,
        },
      ];
    })
  );
}
