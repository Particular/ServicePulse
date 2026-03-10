import { render, describe, test, screen, expect, within, userEvent } from "@component-test-utils";
import { vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import sut from "@/components/configuration/EndpointConnection.vue";
import { createTestingPinia } from "@pinia/testing";

// ─── DSL ─────────────────────────────────────────────────────────────────────

interface ComponentDSL {
  actions: {
    selectCodeOnlyTab(): Promise<void>;
    selectJsonFileTab(): Promise<void>;
    copyCodeSnippet(index?: number): Promise<void>;
  };
  verify: {
    codeOnlyTabIsActive(): void;
    jsonFileTabIsActive(): void;
    renderedCodeContains(expectedContent: string[]): void;
    connectionErrorsAreDisplayed(expectedErrors: string[]): void;
    clipboardContains(clipboard: ClipboardMock, expectedContent: string[]): void;
  };
}

type ClipboardMock = { writeText: ReturnType<typeof vi.fn> };

// ─── Test suite ──────────────────────────────────────────────────────────────

describe("FEATURE: Endpoint Connection Configuration", () => {
  describe("RULE: Examples should match the current configuration", () => {
    test("EXAMPLE: The endpoint configuration only view is selected by default", async () => {
      /*
       * Given configuration data has been loaded
       * When the endpoint connection screen is displayed
       * Then the endpoint configuration only view is active
       * And the inline C# snippet is rendered
       */
      const componentDriver = await renderComponent({
        initialState: {
          EndpointSettingsStore: endpointSettingsWithSnippets(),
        },
      });

      componentDriver.verify.codeOnlyTabIsActive();
      componentDriver.verify.renderedCodeContains(["ServicePlatformConnectionConfiguration.Parse", "ConnectToServicePlatform"]);
    });

    test("EXAMPLE: The JSON file view is selected", async () => {
      /*
       * Given configuration data has been loaded
       * When the JSON file view is selected
       * Then the JSON file view is active
       * And the JSON snippet and configuration are rendered
       */
      const componentDriver = await renderComponent({
        initialState: {
          EndpointSettingsStore: endpointSettingsWithSnippets(),
        },
      });

      await componentDriver.actions.selectJsonFileTab();
      componentDriver.verify.jsonFileTabIsActive();
      componentDriver.verify.renderedCodeContains(["File.ReadAllText", "Heartbeats"]);
    });
  });

  describe("RULE: Copying the example should happen with a single click", () => {
    test("EXAMPLE: Copying from the endpoint configuration only view", async () => {
      /*
       * Given the endpoint configuration only view is active
       * When the copy button is clicked
       * Then the C# inline snippet is copied to the clipboard
       */
      const componentDriver = await renderComponent({
        initialState: {
          EndpointSettingsStore: endpointSettingsWithSnippets(),
        },
      });
      const clipboard = setupClipboardMock();

      await componentDriver.actions.copyCodeSnippet();
      componentDriver.verify.clipboardContains(clipboard, ["ServicePlatformConnectionConfiguration.Parse", "Heartbeats"]);
    });

    test("EXAMPLE: Copying from the JSON file view", async () => {
      /*
       * Given the JSON file view is active
       * When the copy buttons are clicked
       * Then the C# snippet and JSON config are copied to the clipboard
       */
      const componentDriver = await renderComponent({
        initialState: {
          EndpointSettingsStore: endpointSettingsWithSnippets(),
        },
      });
      const clipboard = setupClipboardMock();

      await componentDriver.actions.selectJsonFileTab();

      await componentDriver.actions.copyCodeSnippet(0);
      componentDriver.verify.clipboardContains(clipboard, ["File.ReadAllText"]);

      await componentDriver.actions.copyCodeSnippet(1);
      componentDriver.verify.clipboardContains(clipboard, ['"Heartbeats"']);
    });
  });
});

// ─── Render helper ───────────────────────────────────────────────────────────

async function renderComponent({ initialState = {} }: { initialState?: Record<string, unknown> } = {}): Promise<ComponentDSL> {
  const user = userEvent.setup();

  render(sut, {
    global: {
      plugins: [
        createTestingPinia({
          initialState,
          createSpy: vi.fn,
          stubActions: true,
        }),
      ],
      directives: {
        tippy: () => {},
      },
      stubs: {
        RouterLink: true,
      },
    },
  });

  await flushPromises();

  return {
    actions: {
      async selectCodeOnlyTab() {
        await user.click(screen.getByRole("link", { name: /endpoint configuration only/i }));
      },
      async selectJsonFileTab() {
        await user.click(screen.getByRole("link", { name: /json file/i }));
      },
      async copyCodeSnippet(index = 0) {
        const copyButtons = getCopyButtons();
        await user.click(copyButtons[index]);
        await flushPromises();
      },
    },
    verify: {
      codeOnlyTabIsActive() {
        expect(screen.getByRole("tabpanel", { name: /endpoint configuration only/i })).toBeInTheDocument();
      },
      jsonFileTabIsActive() {
        expect(screen.getByRole("tabpanel", { name: /json file/i })).toBeInTheDocument();
      },
      renderedCodeContains(expectedContent: string[]) {
        const tabpanels = screen.getAllByRole("tabpanel");
        const visibleText = tabpanels.map((panel) => panel.textContent).join(" ");
        for (const content of expectedContent) {
          expect(visibleText).toContain(content);
        }
      },
      connectionErrorsAreDisplayed(expectedErrors: string[]) {
        const alert = screen.getByRole("alert");
        for (const error of expectedErrors) {
          expect(within(alert).getByText(error)).toBeInTheDocument();
        }
      },
      clipboardContains(clipboard: ClipboardMock, expectedContent: string[]) {
        const lastCopied = clipboard.writeText.mock.calls[clipboard.writeText.mock.calls.length - 1]?.[0] ?? "";
        for (const content of expectedContent) {
          expect(lastCopied).toContain(content);
        }
      },
    },
  };
}

// ─── DOM query helpers ───────────────────────────────────────────────────────

function getCopyButtons(): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll('button[aria-label*="copy"], button[aria-label*="Copy"]')).filter((btn) => {
    const style = window.getComputedStyle(btn);
    return !(style.display === "none" || style.visibility === "hidden");
  }) as HTMLButtonElement[];
}

// ─── Mock helpers ────────────────────────────────────────────────────────────

function setupClipboardMock(): ClipboardMock {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    writable: true,
    configurable: true,
  });
  return { writeText };
}

// ─── Precondition helpers ────────────────────────────────────────────────────

function endpointSettingsWithSnippets() {
  return {
    loading: false,
    queryErrors: [],
    inlineSnippet: `var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(@"{
    ""Heartbeats"": {
        ""Enabled"": true,
        ""HeartbeatsQueue"": ""Particular.ServiceControl@XXX""
    }
}");

endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);`,
    jsonSnippet: `var json = File.ReadAllText("<path-to-json-file>.json");
var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(json);
endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);`,
    jsonConfig: `{
    "Heartbeats": {
        "Enabled": true,
        "HeartbeatsQueue": "Particular.ServiceControl@XXX"
    }
}`,
  };
}
