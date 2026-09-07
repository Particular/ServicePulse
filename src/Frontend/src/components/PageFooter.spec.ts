import { render, screen } from "@component-test-utils";
import { createTestingPinia } from "@pinia/testing";
import { describe, expect, test, vi } from "vitest";
import PageFooter from "@/components/PageFooter.vue";
import { useLicenseStore } from "@/stores/LicenseStore";

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

describe("PageFooter", () => {
  test("shows updates available and links to platform health when any row is outdated", () => {
    platformHealthStore.outdatedOnly = false;
    platformHealthStore.rows = [{ upgradeAvailable: false }, { upgradeAvailable: true }];

    renderFooter();

    const updatesLink = screen.getByRole("link", { name: /Updates available/i });
    expect(updatesLink).toBeInTheDocument();
    expect(updatesLink).toHaveAttribute("href", "/platform-health");
  });

  test("shows platform up to date when no rows are outdated", () => {
    platformHealthStore.outdatedOnly = false;
    platformHealthStore.rows = [{ upgradeAvailable: false }];

    renderFooter();

    expect(screen.getByText("Platform up to date")).toBeInTheDocument();
  });
});

function renderFooter() {
  const pinia = createTestingPinia({ stubActions: false });
  const licenseStore = useLicenseStore(pinia);
  licenseStore.license.license_status = "valid" as never;
  licenseStore.licenseStatus.isTrialLicense = false;

  return render(PageFooter, {
    global: {
      plugins: [pinia],
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
}
