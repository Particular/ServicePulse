import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@component-test-utils";
import { RouterLinkStub } from "@vue/test-utils";
import PlatformHealthMenuItem from "@/components/platformhealth/PlatformHealthMenuItem.vue";

vi.mock("@/composables/usePlatformHealthStoreAutoRefresh", () => ({
  default: () => ({
    store: {
      severity: "none",
      outdatedOnly: true,
    },
  }),
}));

describe("PlatformHealthMenuItem", () => {
  test("shows a white info exclamation when instances are only outdated", () => {
    const { container } = render(PlatformHealthMenuItem, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });

    expect(screen.getByText(/Platform health/i)).toBeInTheDocument();
    expect(container.querySelector(".info")).not.toBeNull();
  });
});
