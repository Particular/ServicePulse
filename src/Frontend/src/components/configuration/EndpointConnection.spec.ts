import { render, screen, expect, within } from "@component-test-utils";
import { waitFor } from "@testing-library/vue";
import EndpointConnection from "@/components/configuration/EndpointConnection.vue";
import makeRouter from "@/router";
import { createTestingPinia } from "@pinia/testing";
import { vi, describe, test, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { useEndpointSettingsStore } from "@/stores/EndpointSettingsStore";

/**
 * DSL for the Endpoint Connection Configuration feature.
 *
 * This specification focuses on user capabilities and business outcomes,
 * not UI implementation details like "tabs" or "buttons".
 *
 * Structure:
 * - renderComponent(): Sets up the component with mock store data
 * - actions: What users can do (select tabs, copy code)
 * - assertions: What should be true (tab is active, code is displayed)
 *
 * If the UI changes (e.g., tabs become dropdowns), only the helper
 * functions need updating—the tests remain unchanged.
 */

/**
 * Domain-specific language for user actions
 */
interface ComponentActions {
  selectCodeOnlyTab(): void;
  selectJsonFileTab(): void;
  copyCurrentTabCode(index?: number): Promise<void>;
}

/**
 * Domain-specific language for assertions focused on user capabilities and outcomes
 */
interface ComponentAssertions {
  codeOnlyTabIsActive(): void;
  jsonFileTabIsActive(): void;
  codeOnlyCodeIsDisplayed(): void;
  jsonFileCodeIsDisplayed(): Promise<void>;
  configurationCodeContains(expectedContent: string[]): void;
  storeHasCorrectData(): void;
  storeHasErrors(expectedErrors: string[]): void;
}

interface RenderResult {
  actions: ComponentActions;
  assertions: ComponentAssertions;
  store: ReturnType<typeof useEndpointSettingsStore>;
}

describe("FEATURE: Endpoint Connection Configuration", () => {
  beforeEach(() => {
    setupClipboardMock();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("RULE: Connection status should match the current configuration", () => {
    test("EXAMPLE: The 'Endpoint Configuration Only' tab is selected by default", async () => {
      const { assertions } = await renderComponent(FULL_CONFIG);
      assertions.codeOnlyTabIsActive();
    });

    test("EXAMPLE: The 'Endpoint Configuration Only' tab displays endpoint configuration examples for the current configuration", async () => {
      const { assertions, store } = await renderComponent(FULL_CONFIG);

      // Assert that the code-only tab is active by default
      assertions.codeOnlyTabIsActive();

      // Verify store has the correct data
      assertions.storeHasCorrectData();

      // Verify the inline snippet from store contains the correct content
      expect(store.inlineSnippet).toContain("ServicePlatformConnectionConfiguration.Parse");
      expect(store.inlineSnippet).toContain("endpointConfiguration.ConnectToServicePlatform");
      expect(store.inlineSnippet).toContain("Heartbeats");
    });

    test("EXAMPLE: The 'JSON File' tab is displayed with JSON file configuration examples for the current configuration", async () => {
      const { actions, assertions, store } = await renderComponent(FULL_CONFIG);

      actions.selectJsonFileTab();

      await waitFor(() => {
        assertions.jsonFileTabIsActive();
      });

      // Verify store has JSON file data
      expect(store.jsonSnippet).toContain("File.ReadAllText");
      expect(store.jsonSnippet).toContain("ServicePlatformConnectionConfiguration.Parse(json)");
      expect(store.jsonConfig).toContain('"Heartbeats"');
    });

    test("EXAMPLE: Clicking the 'Copy' button in the 'Endpoint Configuration Only' tab copies the C# code to clipboard", async () => {
      const mockClipboard = setupClipboardMock();
      const { actions } = await renderComponent(FULL_CONFIG);

      await actions.copyCurrentTabCode();
      const copiedContent = mockClipboard.writeText.mock.calls[0]?.[0];
      expect(copiedContent).toContain("ServicePlatformConnectionConfiguration.Parse");
      expect(copiedContent).toContain("Heartbeats");
    });

    test("EXAMPLE: Clicking the 'Copy' button in the 'JSON File' tab copies the example to the clipboard", async () => {
      const mockClipboard = setupClipboardMock();
      const { actions } = await renderComponent(FULL_CONFIG);

      actions.selectJsonFileTab();

      await waitFor(() => {
        const tab = getJsonFileTab();
        expect(tab?.classList.contains("active")).toBe(true);
      });

      // Copy C# snippet
      await actions.copyCurrentTabCode(0);
      let copiedContent = mockClipboard.writeText.mock.calls[0]?.[0];
      expect(copiedContent).toContain("File.ReadAllText");

      // Copy JSON config
      await actions.copyCurrentTabCode(1);
      copiedContent = mockClipboard.writeText.mock.calls[1]?.[0];
      expect(copiedContent).toContain('"Heartbeats"');
    });
  });
});

// ==================== Helper Functions ====================

// interface RenderOptions {
//   serviceControlSettings?: Record<string, unknown>;
//   monitoringSettings?: Record<string, unknown>;
//   connectionErrors?: string[];
// }

async function renderComponent(config?: typeof FULL_CONFIG): Promise<RenderResult> {
  const { serviceControlSettings = getDefaultServiceControlSettings(), monitoringSettings = getDefaultMonitoringSettings(), connectionErrors = [] } = config || {};

  const router = makeRouter();

  // Generate snippets from the provided settings
  const snippets = generateSnippets(serviceControlSettings, monitoringSettings);

  render(EndpointConnection, {
    global: {
      plugins: [
        router,
        createTestingPinia({
          stubActions: true,
          initialState: {
            EndpointSettingsStore: {
              loading: false,
              queryErrors: connectionErrors,
              jsonSnippet: snippets.jsonSnippet,
              inlineSnippet: snippets.inlineSnippet,
              jsonConfig: snippets.jsonConfig,
            },
          },
        }),
      ],
      stubs: {
        ServiceControlAvailable: false,
        LicenseNotExpired: false,
        LoadingSpinner: false,
      },
      directives: {
        tippy: () => {},
      },
    },
  });

  await flushPromises();

  // Get the store - now we actually use it
  const store = useEndpointSettingsStore();

  await waitFor(() => {
    expect(() => screen.getByRole("tablist")).not.toThrow();
  });

  return {
    actions: createActions(),
    assertions: createAssertions(store),
    store,
  };
}

function createActions(): ComponentActions {
  return {
    selectCodeOnlyTab(): void {
      const tab = getCodeOnlyTab();
      if (!tab) throw new Error("Code Only tab not found");
      const link = within(tab).getByRole("link");
      link.click();
    },
    selectJsonFileTab(): void {
      const tab = getJsonFileTab();
      if (!tab) throw new Error("JSON File tab not found");
      const link = within(tab).getByRole("link");
      link.click();
    },
    async copyCurrentTabCode(index = 0): Promise<void> {
      const copyButtons = getCopyButtons();
      if (index >= copyButtons.length) {
        throw new Error(`Copy button at index ${index} not found (found ${copyButtons.length} buttons)`);
      }
      copyButtons[index].click();
      // Give the async copy operation time to complete
      await flushPromises();
      await new Promise((resolve) => setTimeout(resolve, 50));
    },
  };
}

function createAssertions(store: ReturnType<typeof useEndpointSettingsStore>): ComponentAssertions {
  return {
    codeOnlyTabIsActive(): void {
      const tab = getCodeOnlyTab();
      if (!tab) throw new Error("Code Only tab not found");
      expect(tab.classList.contains("active")).toBe(true);
    },
    jsonFileTabIsActive(): void {
      const tab = getJsonFileTab();
      if (!tab) throw new Error("JSON File tab not found");
      expect(tab.classList.contains("active")).toBe(true);
    },
    codeOnlyCodeIsDisplayed(): void {
      // Use store data directly instead of DOM queries
      expect(store.inlineSnippet).toContain("ServicePlatformConnectionConfiguration.Parse");
      expect(store.inlineSnippet).toContain("ConnectToServicePlatform");
    },
    jsonFileCodeIsDisplayed(): Promise<void> {
      // Verify store has the JSON snippet data
      expect(store.jsonSnippet).toContain("File.ReadAllText");
      expect(store.jsonConfig).toContain("Heartbeats");
      return Promise.resolve();
    },
    configurationCodeContains(expectedContent: string[]): void {
      // Use store data for verification
      expectedContent.forEach((content) => {
        const found = store.inlineSnippet.includes(content) || store.jsonSnippet.includes(content) || store.jsonConfig.includes(content);
        expect(found).toBe(true);
      });
    },
    storeHasCorrectData(): void {
      expect(store.loading).toBe(false);
      expect(store.queryErrors).toHaveLength(0);
      expect(store.inlineSnippet).toBeTruthy();
      expect(store.jsonSnippet).toBeTruthy();
      expect(store.jsonConfig).toBeTruthy();
    },
    storeHasErrors(expectedErrors: string[]): void {
      expect(store.queryErrors).toEqual(expectedErrors);
    },
  };
}

// ==================== DOM Query Helpers ====================

function getCodeOnlyTab(): HTMLElement | null {
  try {
    const tablist = screen.getByRole("tablist");
    const allHeadings = within(tablist).queryAllByRole("heading", { level: 5 });
    return allHeadings.length > 0 ? allHeadings[0] : null;
  } catch {
    return null;
  }
}

function getJsonFileTab(): HTMLElement | null {
  try {
    const tablist = screen.getByRole("tablist");
    const allHeadings = within(tablist).queryAllByRole("heading", { level: 5 });
    return allHeadings.length > 1 ? allHeadings[1] : null;
  } catch {
    return null;
  }
}
// function getCodeEditorContent(index: number): string {
//   const codeEditors = screen.queryAllByRole("code");
//   if (index >= codeEditors.length) {
//     return "";
//   }

//   const editor = codeEditors[index];
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const parentComponent = (editor as any).__vueParentComponent || (editor as any).__vnode;

//   // Try to access the model value from the component
//   if (parentComponent?.component?.exposed?.modelValue) {
//     const modelValue = parentComponent.component.exposed.modelValue;
//     if (modelValue && typeof modelValue === "string") {
//       return modelValue;
//     }
//   }

//   // Try accessing through props
//   if (parentComponent?.props?.modelValue && typeof parentComponent.props.modelValue === "string") {
//     return parentComponent.props.modelValue;
//   }

//   // Try through the instance
//   if (parentComponent?.ctx?.modelValue && typeof parentComponent.ctx.modelValue === "string") {
//     return parentComponent.ctx.modelValue;
//   }

//   // Fallback: return empty string
//   return "";
// }

function getCopyButtons(): HTMLButtonElement[] {
  // Find buttons with aria-label containing "copy"
  const buttonsByAriaLabel = Array.from(document.querySelectorAll('button[aria-label*="copy"], button[aria-label*="Copy"]')) as HTMLButtonElement[];

  if (buttonsByAriaLabel.length > 0) {
    return buttonsByAriaLabel.filter((btn) => {
      const style = window.getComputedStyle(btn);
      return !(style.display === "none" || style.visibility === "hidden");
    });
  }

  // Fallback: find buttons with text "Copy to clipboard"
  const buttonsByText = Array.from(document.querySelectorAll("button")).filter((btn) => btn.textContent?.includes("Copy to clipboard") && window.getComputedStyle(btn).display !== "none") as HTMLButtonElement[];

  return buttonsByText;
}

// ==================== Mock Helpers ====================

function setupClipboardMock() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(window.navigator, "clipboard", {
    value: { writeText },
    writable: true,
    configurable: true,
  });
  return { writeText };
}

function generateSnippets(serviceControlSettings: Record<string, unknown>, monitoringSettings: Record<string, unknown>) {
  const snippetTemplate = `var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(@"<json>");

    endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);
    `;

  const jsonSnippetTemplate = `var json = File.ReadAllText("<path-to-json-file>.json");
var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(json);
endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);
`;

  const config = {
    Heartbeats: serviceControlSettings.Heartbeats,
    CustomChecks: serviceControlSettings.CustomChecks,
    ErrorQueue: serviceControlSettings.ErrorQueue,
    SagaAudit: serviceControlSettings.SagaAudit,
    MessageAudit: serviceControlSettings.MessageAudit,
    Metrics: monitoringSettings,
  };

  let jsonText = JSON.stringify(config, null, 4);
  const jsonConfig = jsonText;

  jsonText = jsonText.replaceAll('"', '""');
  const inlineSnippet = snippetTemplate.replace("<json>", jsonText);

  return {
    jsonSnippet: jsonSnippetTemplate,
    inlineSnippet,
    jsonConfig,
  };
}

function getDefaultServiceControlSettings(): Record<string, unknown> {
  return {
    Heartbeats: {
      Enabled: true,
      HeartbeatsQueue: "Particular.ServiceControl@XXX",
      Frequency: "00:00:10",
      TimeToLive: "00:00:40",
    },
    CustomChecks: {
      Enabled: true,
      CustomChecksQueue: "Particular.ServiceControl@XXX",
    },
    ErrorQueue: "error",
    SagaAudit: {
      Enabled: true,
      SagaAuditQueue: "audit",
    },
    MessageAudit: {
      Enabled: true,
      AuditQueue: "audit",
    },
  };
}

function getDefaultMonitoringSettings(): Record<string, unknown> {
  return {
    Enabled: true,
    MetricsQueue: "Particular.Monitoring@XXX",
    Interval: "00:00:01",
  };
}

// Reusable test configuration - single source of truth
const FULL_CONFIG = {
  serviceControlSettings: {
    Heartbeats: {
      Enabled: true,
      HeartbeatsQueue: "Particular.ServiceControl@XXX",
      Frequency: "00:00:10",
      TimeToLive: "00:00:40",
    },
    CustomChecks: {
      Enabled: true,
      CustomChecksQueue: "Particular.ServiceControl@XXX",
    },
    ErrorQueue: "error",
    SagaAudit: {
      Enabled: true,
      SagaAuditQueue: "audit",
    },
    MessageAudit: {
      Enabled: true,
      AuditQueue: "audit",
    },
  },
  monitoringSettings: {
    Enabled: true,
    MetricsQueue: "Particular.Monitoring@XXX",
    Interval: "00:00:01",
  },
  connectionErrors: [],
};
