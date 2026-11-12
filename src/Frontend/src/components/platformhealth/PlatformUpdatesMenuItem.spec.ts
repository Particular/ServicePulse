import { render, screen } from "@component-test-utils";
import { describe, expect, test, vi } from "vitest";
import PlatformUpdatesMenuItem from "@/components/platformhealth/PlatformUpdatesMenuItem.vue";

const RouterLinkStub = {
  props: ["to"],
  template: '<a :href="typeof to === `string` ? to : to?.link ?? ``"><slot /></a>',
};

const platformHealthStore = vi.hoisted(() => ({
  outdatedOnly: false,
  rows: [] as Array<{ upgradeAvailable: boolean }>,
}));

vi.mock("@/composables/usePlatformHealthStoreAutoRefresh", () => ({
  default: () => ({
    store: platformHealthStore,
  }),
}));

describe("PlatformUpdatesMenuItem", () => {
  test("shows updates available and links to platform health when any row is outdated", () => {
    platformHealthStore.outdatedOnly = false;
    platformHealthStore.rows = [{ upgradeAvailable: false }, { upgradeAvailable: true }];

    renderItem();

    const updatesLink = screen.getByRole("link", { name: /Updates available/i });
    expect(updatesLink).toBeInTheDocument();
    expect(updatesLink).toHaveAttribute("href", "/platform-health");
  });

  test("shows nothing when no rows are outdated", () => {
    platformHealthStore.outdatedOnly = false;
    platformHealthStore.rows = [{ upgradeAvailable: false }];

    renderItem();

    expect(screen.queryByText(/Updates available/i)).not.toBeInTheDocument();
  });
});

function renderItem() {
  return render(PlatformUpdatesMenuItem, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
}
