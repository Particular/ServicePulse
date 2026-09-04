import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@component-test-utils";
import { RouterLinkStub } from "@vue/test-utils";
import PlatformHealthMenuItem from "@/components/platformhealth/PlatformHealthMenuItem.vue";

const store = vi.hoisted(() => ({
  severity: "none" as "danger" | "warning" | "none",
  outdatedOnly: false,
}));

vi.mock("@/composables/usePlatformHealthStoreAutoRefresh", () => ({
  default: () => ({
    store,
  }),
}));

describe("PlatformHealthMenuItem", () => {
  test("shows a no-issues tooltip when there are no issues", () => {
    store.severity = "none";
    store.outdatedOnly = false;

    renderMenuItem();

    const tooltipTarget = document.querySelector(".tooltip-target");

    expect(tooltipTarget).toHaveAttribute("title", "");
    expect(tooltipTarget).toHaveAttribute("data-tooltip", "Platform health: No issues detected.");
  });

  test("shows a white info exclamation and outdated tooltip when instances are only outdated", () => {
    store.severity = "none";
    store.outdatedOnly = true;

    const { container } = renderMenuItem();

    expect(screen.getByText(/Platform health/i)).toBeInTheDocument();
    const tooltipTarget = document.querySelector(".tooltip-target");

    expect(tooltipTarget).toHaveAttribute("title", "");
    expect(tooltipTarget).toHaveAttribute("data-tooltip", "Platform health: Update available. One or more platform instances are out of date.");
    expect(container.querySelector(".info")).not.toBeNull();
  });

  test("shows a warning tooltip when instances are degraded", () => {
    store.severity = "warning";
    store.outdatedOnly = false;

    const { container } = renderMenuItem();

    const tooltipTarget = document.querySelector(".tooltip-target");

    expect(tooltipTarget).toHaveAttribute("title", "");
    expect(tooltipTarget).toHaveAttribute("data-tooltip", "Platform health: Attention needed. One or more platform instances are degraded.");
    expect(container.querySelector(".warning")).not.toBeNull();
  });

  test("shows a danger tooltip when platform instances are unavailable", () => {
    store.severity = "danger";
    store.outdatedOnly = true;

    const { container } = renderMenuItem();

    const tooltipTarget = document.querySelector(".tooltip-target");

    expect(tooltipTarget).toHaveAttribute("title", "");
    expect(tooltipTarget).toHaveAttribute("data-tooltip", "Platform health: Action required. One or more platform instances are unavailable.");
    expect(container.querySelector(".danger")).not.toBeNull();
  });
});

function renderMenuItem() {
  return render(PlatformHealthMenuItem, {
    global: {
      directives: {
        tippy: {
          mounted(el, binding) {
            el.setAttribute("data-tooltip", String(binding.value));
          },
          updated(el, binding) {
            el.setAttribute("data-tooltip", String(binding.value));
          },
        },
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
}
