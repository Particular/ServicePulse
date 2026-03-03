import { render, screen, expect, within } from "@component-test-utils";
import { waitFor } from "@testing-library/vue";
import EndpointConnection from "@/components/configuration/EndpointConnection.vue";
import makeRouter from "@/router";
import { createTestingPinia } from "@pinia/testing";
import { vi, describe, test, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { useEndpointConnectionStore } from "@/stores/EndpointConnectionStore";

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
  configurationCodeContains(expectedContent: string[]): void; // NEW
}

interface RenderResult {
  actions: ComponentActions;
  assertions: ComponentAssertions;
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
      const { assertions } = await renderComponent(FULL_CONFIG);

      // Assert that the code-only tab is active by default
      assertions.codeOnlyTabIsActive();

      // Verify the inline snippet contains the correct content
      // Query the code editor element specifically to avoid including button text
      // const codeEditor = screen.getByRole("code");
      const editorContent = getCodeEditorContent(0);

      expect(editorContent).toContain("ServicePlatformConnectionConfiguration.Parse");
      expect(editorContent).toContain("endpointConfiguration.ConnectToServicePlatform");
      expect(editorContent).toContain("Heartbeats");
    });

    test("EXAMPLE: The 'JSON File' tab is displayed with JSON file configuration examples for the current configuration", async () => {
      const { actions, assertions } = await renderComponent(FULL_CONFIG);

      actions.selectJsonFileTab();

      // Wait for the JSON tab to become active
      await waitFor(() => {
        assertions.jsonFileTabIsActive();
      });

      // Verify both code editors are displayed with correct content
      expect(screen.getByText(/File.ReadAllText/)).toBeInTheDocument();
      expect(screen.getByText(/ServicePlatformConnectionConfiguration.Parse\(json\)/)).toBeInTheDocument();
      expect(screen.getByText(/"Heartbeats":/)).toBeInTheDocument();
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

interface RenderOptions {
  serviceControlSettings?: Record<string, unknown>;
  monitoringSettings?: Record<string, unknown>;
  connectionErrors?: string[];
}

async function renderComponent(config?: typeof FULL_CONFIG): Promise<RenderResult> {
  const { serviceControlSettings = getDefaultServiceControlSettings(), monitoringSettings = getDefaultMonitoringSettings(), connectionErrors = [] } = config;

  const router = makeRouter();

  // Generate snippets from the provided settings
  const snippets = generateSnippets(serviceControlSettings, monitoringSettings);

  render(EndpointConnection, {
    global: {
      plugins: [
        router,
        createTestingPinia({
          stubActions: true, // Stub actions so getCode() doesn't make real HTTP calls
          initialState: {
            EndpointConnectionStore: {
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

  // Wait for the component to render
  await flushPromises();

  // Get the store and verify it's using the test data
  const store = useEndpointConnectionStore();

  await waitFor(() => {
    // Wait for the tabs to be available, indicating loading is done
    expect(() => screen.getByRole("tablist")).not.toThrow();
  });

  return {
    actions: createActions(),
    assertions: createAssertions(),
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

function createAssertions(): ComponentAssertions {
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
      const tabpanel = screen.getByRole("tabpanel", { name: /Endpoint configuration only/i });
      const codeEditor = within(tabpanel).queryByRole("code");
      expect(codeEditor).toBeInTheDocument();
    },
    async jsonFileCodeIsDisplayed(): Promise<void> {
      await waitFor(() => {
        const tabpanel = screen.getByRole("tabpanel", { name: /JSON file/i });
        expect(tabpanel).toBeInTheDocument();
        const editors = within(tabpanel).queryAllByRole("code");
        expect(editors.length).toBeGreaterThanOrEqual(2);
      });
    },
    async contentContainsServicePlatformConfiguration(): Promise<void> {
      await waitFor(() => {
        const codeEditors = screen.queryAllByRole("code");
        expect(codeEditors.length).toBeGreaterThan(0);

        const content = getCodeEditorContent(0);
        expect(content).toContain("ServicePlatformConnectionConfiguration.Parse");
        expect(content).toContain("ConnectToServicePlatform");
      });
    },
    async contentContainsJsonConfiguration(): Promise<void> {
      await waitFor(() => {
        const tabpanel = screen.getByRole("tabpanel", { name: /JSON file/i });
        expect(tabpanel).toBeInTheDocument();
        const codeEditors = within(tabpanel).queryAllByRole("code");
        expect(codeEditors.length).toBeGreaterThanOrEqual(2);

        // Get content from second editor (the JSON configuration, not the C# snippet)
        const content = getCodeEditorContent(1);
        expect(content.length).toBeGreaterThan(0);
        // The configuration is in JSON format
        expect(content).toMatch(/Heartbeats|CustomChecks|ErrorQueue/);
      });
    },
    errorMessagesAreDisplayed(expectedErrors: string[]): void {
      const alertElement = screen.getByRole("alert");
      expect(alertElement).toBeInTheDocument();
      expectedErrors.forEach((error) => {
        expect(within(alertElement).getByText(error)).toBeInTheDocument();
      });
    },
    noErrorMessagesAreDisplayed(): void {
      const alertElement = screen.queryByRole("alert");
      expect(alertElement).not.toBeInTheDocument();
    },
    codeHasBeenCopiedToClipboard(clipboardContent: string): void {
      expect(clipboardContent).toBeTruthy();
      // Verify it contains expected configuration structure
      if (clipboardContent.includes("File.ReadAllText")) {
        // JSON file snippet
        expect(clipboardContent).toContain("ServicePlatformConnectionConfiguration.Parse");
      } else if (clipboardContent.includes('"')) {
        // Inline snippet with escaped quotes
        expect(clipboardContent).toContain("ServicePlatformConnectionConfiguration.Parse");
      }
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
function getCodeEditorContent(index: number): string {
  const codeEditors = screen.queryAllByRole("code");
  if (index >= codeEditors.length) {
    return "";
  }

  const editor = codeEditors[index];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parentComponent = (editor as any).__vueParentComponent || (editor as any).__vnode;

  // Try to access the model value from the component
  if (parentComponent?.component?.exposed?.modelValue) {
    const modelValue = parentComponent.component.exposed.modelValue;
    if (modelValue && typeof modelValue === "string") {
      return modelValue;
    }
  }

  // Try accessing through props
  if (parentComponent?.props?.modelValue && typeof parentComponent.props.modelValue === "string") {
    return parentComponent.props.modelValue;
  }

  // Try through the instance
  if (parentComponent?.ctx?.modelValue && typeof parentComponent.ctx.modelValue === "string") {
    return parentComponent.ctx.modelValue;
  }

  // Fallback: return empty string
  return "";
}

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
};
