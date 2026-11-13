import { render, screen } from "@component-test-utils";
import { createTestingPinia } from "@pinia/testing";
import { afterEach, describe, expect, test, vi } from "vitest";
import PlatformVersionInfo from "@/components/PlatformVersionInfo.vue";

const RouterLinkStub = {
  props: ["to"],
  template: '<a :href="typeof to === `string` ? to : to?.link ?? ``"><slot /></a>',
};

const platformHealthStore = vi.hoisted(() => ({
  severity: "none" as "danger" | "warning" | "none",
  rows: [] as Array<{ upgradeAvailable: boolean }>,
}));

vi.mock("@/composables/usePlatformHealthStoreAutoRefresh", () => ({
  default: () => ({
    store: platformHealthStore,
  }),
}));

describe("PlatformVersionInfo", () => {
  afterEach(() => {
    window.defaultConfig.isIntegrated = false;
  });

  test("shows the ServicePulse version and standalone hosting mode", () => {
    platformHealthStore.rows = [];

    renderInfo();

    expect(screen.getByText(/v.+ · Standalone/)).toHaveTextContent(/ServicePulse v\S+ · Standalone/);
  });

  test("shows integrated hosting mode", () => {
    window.defaultConfig.isIntegrated = true;
    platformHealthStore.rows = [];

    renderInfo();

    expect(screen.getByText(/v.+ · Integrated/)).toBeInTheDocument();
  });

  test("shows updates available and links to platform health when any row is outdated", () => {
    platformHealthStore.severity = "none";
    platformHealthStore.rows = [{ upgradeAvailable: false }, { upgradeAvailable: true }];

    renderInfo();

    const updatesLink = screen.getByRole("link", { name: /Updates available/i });
    expect(updatesLink).toHaveAttribute("href", "/platform-health");
  });

  test("shows updates available while an instance is unavailable", () => {
    platformHealthStore.severity = "danger";
    platformHealthStore.rows = [{ upgradeAvailable: true }];

    renderInfo();

    expect(screen.getByRole("link", { name: /Updates available/i })).toBeInTheDocument();
  });

  test("shows platform up to date when no rows are outdated", () => {
    platformHealthStore.severity = "none";
    platformHealthStore.rows = [{ upgradeAvailable: false }];

    renderInfo();

    expect(screen.getByText("Platform up to date")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Updates available/i })).toBeNull();
  });
});

function renderInfo() {
  return render(PlatformVersionInfo, {
    global: {
      plugins: [createTestingPinia({ stubActions: false })],
      directives: { tippy: {} },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
}
