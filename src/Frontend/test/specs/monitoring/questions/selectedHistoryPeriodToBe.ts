import { screen, within } from "@testing-library/vue";

export function selectedHistoryPeriodToBe(historyPeriod: number) {
  const historyPeriodList = screen.queryByRole("list", { name: "history-period-list" });
  if (historyPeriodList) {
    const historyPeriodListItem = within(historyPeriodList).queryByRole("listitem", { name: `${historyPeriod}` });
    return historyPeriodListItem?.getAttribute("aria-selected")=="true";
  }

  return false;
}
