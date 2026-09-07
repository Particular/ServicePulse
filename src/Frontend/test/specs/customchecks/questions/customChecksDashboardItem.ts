import { getDashboardItems } from "../../heartbeats/questions/getDashboardItems";

export async function queryCustomChecksDashboardItem() {
  const dashboardItems = await getDashboardItems();
  return dashboardItems ? dashboardItems.get("Custom Checks") : null;
}
