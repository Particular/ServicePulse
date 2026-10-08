import { screen } from "@testing-library/vue";

export type HeartbeatsTab = "active" | "inactive";

const tabAccessibleName: Record<HeartbeatsTab, RegExp> = {
  active: /^\s*Healthy Endpoints \(\d+\)\s*$/i,
  inactive: /^\s*Unhealthy Endpoints \(\d+\)\s*$/i,
};

export function getHeartbeatsTabCount(tab: HeartbeatsTab): number | null {
  const tabElement = screen.queryAllByRole("tab").find((element) => tabAccessibleName[tab].test(element.textContent ?? ""));
  const [, count] = tabElement?.textContent?.match(/\((\d+)\)/) ?? [];

  return count === undefined ? null : Number(count);
}
