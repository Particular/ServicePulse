import { beforeEach, describe, expect, test, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { render, screen, userEvent } from "@component-test-utils";
import { Capability, CapabilityStatus } from "@/components/platformcapabilities/constants";
import CapabilityCard from "@/components/platformcapabilities/CapabilityCard.vue";

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/platform-health", component: { template: "<div />" } },
      { path: "/internal", component: { template: "<div />" } },
    ],
  });
}

const baseProps = {
  status: CapabilityStatus.Available,
  title: Capability.Auditing,
  subtitle: "Track messages",
  helpButtonText: "Open help",
  helpButtonUrl: "/internal",
  description: "Capability description",
  allowDismiss: false,
};

describe("CapabilityCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("renders external help as an ExternalLink and does not use window.open", async () => {
    const router = createTestRouter();
    await router.push("/");
    await router.isReady();

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(CapabilityCard, {
      props: {
        ...baseProps,
        helpButtonUrl: "https://docs.particular.net",
      },
      global: {
        plugins: [router],
      },
    });

    const link = screen.getByRole("link", { name: "Open help" });
    expect(link).toHaveAttribute("href", "https://docs.particular.net");
    expect(link).toHaveAttribute("target", "_blank");

    await userEvent.click(link);
    expect(openSpy).not.toHaveBeenCalled();
  });

  test("keeps internal help action as button navigation", async () => {
    const router = createTestRouter();
    await router.push("/");
    await router.isReady();
    const pushSpy = vi.spyOn(router, "push");

    render(CapabilityCard, {
      props: baseProps,
      global: {
        plugins: [router],
      },
    });

    const button = screen.getByRole("button", { name: "Open help" });
    await userEvent.click(button);

    expect(pushSpy).toHaveBeenCalledWith("/internal");
  });
});
