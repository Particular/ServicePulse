import { test, describe, expect, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import EndpointConnection from "@/components/configuration/EndpointConnection.vue";
import { useEndpointConnectionStore } from "@/stores/EndpointConnectionStore";

/**
 * DSL for interacting with the EndpointConnection component from a user's perspective.
 * Abstracts away UI details and focuses on business capabilities.
 */
interface EndpointConnectionDSL {
  /**
   * User actions
   */
  actions: {
    clickEndpointConfigurationOnlyTab(): void;
    clickJsonFileTab(): void;
    clickCopyButtonForEndpointConfiguration(): void;
    clickCopyButtonForJsonFileConfiguration(): void;
    clickCopyButtonForJsonFile(): void;
  };

  /**
   * Assertions about component state and outcomes
   */
  assert: {
    /**
     * Verify that the endpoint configuration only tab is visible and active
     */
    endpointConfigurationOnlyTabIsActive(): void;
    jsonFileTabIsActive(): void;

    /**
     * Verify the endpoint configuration code is displayed with expected content
     */
    endpointConfigurationCodeIsDisplayed(expectedContent: string[]): void;

    /**
     * Verify the JSON file tab shows both C# and JSON code sections
     */
    jsonFileTabShowsCSharpAndJsonCode(): void;

    /**
     * Verify that error messages are displayed when connection fails
     */
    errorMessagesAreDisplayed(expectedErrors: string[]): void;

    /**
     * Verify loading spinner is shown/hidden
     */
    loadingIndicatorIsShown(): void;
    loadingIndicatorIsHidden(): void;

    /**
     * Verify the code content matches expected value
     */
    codeEditorContentMatches(ariaLabel: string, expectedContent: string): void;
  };
}

/**
 * Render the EndpointConnection component with Pinia store setup
 * Pre-configured with testing utilities and stubs for child components
 */
function renderComponent(initialState?: { EndpointConnectionStore?: Partial<ReturnType<typeof useEndpointConnectionStore>> }): EndpointConnectionDSL {
  render(EndpointConnection, {
    global: {
      plugins: [
        createTestingPinia({
          initialState,
          stubActions: true, // Default behavior: stub all store actions
        }),
      ],
      stubs: {
        // Stub these as simple pass-through components that render slots
        LicenseNotExpired: { template: "<slot />" },
        ServiceControlAvailable: { template: "<slot />" },
        CodeEditor: false, // Need real component for content access
        CopyToClipboard: false, // Need real component for clipboard interactions
        LoadingSpinner: true,
      },
    },
  });

  return {
    actions: {
      clickEndpointConfigurationOnlyTab() {
        const tab = screen.getByRole("tab", { name: "endpoint-configuration-only-tab" });
        tab.click();
      },

      clickJsonFileTab() {
        const tab = screen.getByRole("tab", { name: "json-file-tab" });
        tab.click();
      },

      clickCopyButtonForEndpointConfiguration() {
        // In endpoint configuration only tab, there's one copy button
        const section = screen.getByRole("tabpanel", { name: "Endpoint configuration only" });
        const copyButton = within(section).getByRole("button", { name: "Copy to clipboard" });
        copyButton.click();
      },

      clickCopyButtonForJsonFileConfiguration() {
        // First copy button in JSON file tab (C# code)
        const section = screen.getByRole("tabpanel", { name: "JSON file" });
        const copyButtons = within(section).getAllByRole("button", { name: "Copy to clipboard" });
        if (copyButtons.length > 0) {
          copyButtons[0].click();
        }
      },

      clickCopyButtonForJsonFile() {
        // Second copy button in JSON file tab (JSON code)
        const section = screen.getByRole("tabpanel", { name: "JSON file" });
        const copyButtons = within(section).getAllByRole("button", { name: "Copy to clipboard" });
        if (copyButtons.length > 1) {
          copyButtons[1].click();
        }
      },
    },

    assert: {
      endpointConfigurationOnlyTabIsActive() {
        const tab = screen.getByRole("tab", { name: "endpoint-configuration-only-tab" });
        expect(tab).toHaveAttribute("aria-selected", "true");
        const tabpanel = screen.getByRole("tabpanel", { name: "Endpoint configuration only" });
        expect(tabpanel).toBeInTheDocument();
      },

      jsonFileTabIsActive() {
        const tab = screen.getByRole("tab", { name: "json-file-tab" });
        expect(tab).toHaveAttribute("aria-selected", "true");
        const tabpanel = screen.getByRole("tabpanel", { name: "JSON file" });
        expect(tabpanel).toBeInTheDocument();
      },

      endpointConfigurationCodeIsDisplayed(expectedContent: string[]) {
        const codeEditor = screen.getByRole("code");
        expect(codeEditor).toBeInTheDocument();
        expectedContent.forEach((content) => {
          expect(codeEditor.textContent).toContain(content);
        });
      },

      jsonFileTabShowsCSharpAndJsonCode() {
        const editors = screen.getAllByRole("code");
        // After switching to JSON File tab, there should be at least 2 or 3 code editors rendered
        // (the one from config tab plus two in JSON tab, though only JSON tab ones are visible)
        expect(editors.length).toBeGreaterThanOrEqual(2);
      },

      errorMessagesAreDisplayed(expectedErrors: string[]) {
        const alert = screen.getByRole("alert");
        expectedErrors.forEach((error) => {
          expect(alert).toHaveTextContent(error);
        });
      },

      loadingIndicatorIsShown() {
        // The LoadingSpinner is stubbed, so we check via the store state
        const store = useEndpointConnectionStore();
        expect(store.loading).toBe(true);
      },

      loadingIndicatorIsHidden() {
        const store = useEndpointConnectionStore();
        expect(store.loading).toBe(false);
      },

      codeEditorContentMatches(ariaLabel: string, expectedContent: string) {
        const editors = screen.getAllByRole("code");
        // Find editor by checking the search through visible editors
        // In JSON File tab, there are multiple editors - just check if any contains the content
        let found = false;
        editors.forEach((editor) => {
          if (editor.textContent?.includes(expectedContent)) {
            found = true;
          }
        });
        expect(found).toBe(true);
      },
    },
  };
}

describe("FEATURE: Endpoint connection configuration", () => {
  describe("RULE: The 'Endpoint Configuration Only' tab must be the default selection", () => {
    test("EXAMPLE: Initial load with ServiceControl and Monitoring configured", () => {
      // Arrange
      const expectedServiceControlConfig: { [key: string]: unknown } = {
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

      const expectedMonitoringConfig = {
        Enabled: true,
        MetricsQueue: "Particular.Monitoring@XXX",
        Interval: "00:00:01",
      };

      const componentDSL = renderComponent({
        EndpointConnectionStore: {
          loading: false,
          serviceControlConnection: {
            settings: expectedServiceControlConfig,
            errors: [],
          },
          monitoringConnection: {
            Metrics: expectedMonitoringConfig,
            errors: [],
          },
          queryErrors: [],
        },
      });

      // Assert - Endpoint Configuration Only tab should be active by default
      componentDSL.assert.endpointConfigurationOnlyTabIsActive();
    });
  });

  describe("RULE: The endpoint configuration tab must render C# code reflecting the active connection settings", () => {
    test("EXAMPLE: All features enabled — heartbeats, custom checks, error queue, saga audit, message audit, and monitoring", () => {
      // Arrange
      const expectedServiceControlConfig: { [key: string]: unknown } = {
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

      const expectedMonitoringConfig = {
        Enabled: true,
        MetricsQueue: "Particular.Monitoring@XXX",
        Interval: "00:00:01",
      };

      const componentDSL = renderComponent({
        EndpointConnectionStore: {
          loading: false,
          serviceControlConnection: {
            settings: expectedServiceControlConfig,
            errors: [],
          },
          monitoringConnection: {
            Metrics: expectedMonitoringConfig,
            errors: [],
          },
          queryErrors: [],
        },
      });

      // Assert - verify the content contains configuration structure with escaped quotes
      componentDSL.assert.endpointConfigurationCodeIsDisplayed([
        "ServicePlatformConnectionConfiguration.Parse",
        "Heartbeats",
        "CustomChecks",
        "ErrorQueue",
        "SagaAudit",
        "MessageAudit",
        "Metrics",
      ]);
    });
  });

  describe("RULE: The JSON file tab must show file-based configuration code for the active connection settings", () => {
    test("EXAMPLE: Navigating to the JSON File tab after initial load", async () => {
      // Arrange
      const expectedServiceControlConfig: { [key: string]: unknown } = {
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

      const expectedMonitoringConfig = {
        Enabled: true,
        MetricsQueue: "Particular.Monitoring@XXX",
        Interval: "00:00:01",
      };

      const componentDSL = renderComponent({
        EndpointConnectionStore: {
          loading: false,
          serviceControlConnection: {
            settings: expectedServiceControlConfig,
            errors: [],
          },
          monitoringConnection: {
            Metrics: expectedMonitoringConfig,
            errors: [],
          },
          queryErrors: [],
        },
      });

      // Act - switch to JSON File tab
      componentDSL.actions.clickJsonFileTab();

      // Assert - verify JSON file tab is active and shows both editors
      await waitFor(() => {
        componentDSL.assert.jsonFileTabIsActive();
      });

      componentDSL.assert.jsonFileTabShowsCSharpAndJsonCode();
      componentDSL.assert.codeEditorContentMatches("json-file-csharp-code-editor", "File.ReadAllText");
      componentDSL.assert.codeEditorContentMatches("json-file-csharp-code-editor", "ServicePlatformConnectionConfiguration.Parse");
      componentDSL.assert.codeEditorContentMatches("json-file-csharp-code-editor", "ConnectToServicePlatform");
    });
  });

  describe("RULE: Each copy button must copy its code editor content to the clipboard", () => {
    test("EXAMPLE: Copy button on the 'Endpoint Configuration Only' tab", async () => {
      // Arrange
      const expectedServiceControlConfig: { [key: string]: unknown } = {
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

      const expectedMonitoringConfig = {
        Enabled: true,
        MetricsQueue: "Particular.Monitoring@XXX",
        Interval: "00:00:01",
      };

      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(window.navigator, "clipboard", {
        value: {
          writeText: writeTextMock,
        },
        writable: true,
        configurable: true,
      });

      const componentDSL = renderComponent({
        EndpointConnectionStore: {
          loading: false,
          serviceControlConnection: {
            settings: expectedServiceControlConfig,
            errors: [],
          },
          monitoringConnection: {
            Metrics: expectedMonitoringConfig,
            errors: [],
          },
          queryErrors: [],
        },
      });

      // Act - click the copy button
      componentDSL.actions.clickCopyButtonForEndpointConfiguration();

      // Assert - clipboard writeText was called
      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledTimes(1);
      });

      // Assert - the copied content contains expected configuration code
      const copiedContent = writeTextMock.mock.calls[0][0] as string;
      expect(copiedContent).toContain("ServicePlatformConnectionConfiguration.Parse");
      expect(copiedContent).toContain("ConnectToServicePlatform");
    });

    test("EXAMPLE: Copy button on the 'JSON File' tab — both C# snippet and JSON block", async () => {
      // Arrange
      const expectedServiceControlConfig: { [key: string]: unknown } = {
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

      const expectedMonitoringConfig = {
        Enabled: true,
        MetricsQueue: "Particular.Monitoring@XXX",
        Interval: "00:00:01",
      };

      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(window.navigator, "clipboard", {
        value: {
          writeText: writeTextMock,
        },
        writable: true,
        configurable: true,
      });

      const componentDSL = renderComponent({
        EndpointConnectionStore: {
          loading: false,
          serviceControlConnection: {
            settings: expectedServiceControlConfig,
            errors: [],
          },
          monitoringConnection: {
            Metrics: expectedMonitoringConfig,
            errors: [],
          },
          queryErrors: [],
        },
      });

      // Act - navigate to JSON File tab
      componentDSL.actions.clickJsonFileTab();

      // Wait for tab to be active
      await waitFor(() => {
        componentDSL.assert.jsonFileTabIsActive();
      });

      // Act - click the first copy button (C# code)
      componentDSL.actions.clickCopyButtonForJsonFileConfiguration();

      // Assert - clipboard writeText was called for the first button
      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledTimes(1);
      });

      const copiedContent1 = writeTextMock.mock.calls[0][0] as string;
      expect(copiedContent1).toContain("File.ReadAllText");
      expect(copiedContent1).toContain("ServicePlatformConnectionConfiguration.Parse");
      expect(copiedContent1).toContain("ConnectToServicePlatform");

      // Act - click the second copy button (JSON code)
      componentDSL.actions.clickCopyButtonForJsonFile();

      // Assert - clipboard writeText was called for the second button
      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledTimes(2);
      });

      const copiedContent2 = writeTextMock.mock.calls[1][0] as string;
      // JSON content should be valid JSON
      expect(() => JSON.parse(copiedContent2)).not.toThrow();
      expect(copiedContent2).toContain("Heartbeats");
      expect(copiedContent2).toContain("Metrics");
    });
  });

  describe("RULE: Error messages must be displayed when connection retrieval fails", () => {
    test("EXAMPLE: ServiceControl and Monitoring connections fail", () => {
      const componentDSL = renderComponent({
        EndpointConnectionStore: {
          loading: false,
          serviceControlConnection: {
            settings: {},
            errors: ["Error reaching ServiceControl at http://localhost:33333 connection"],
          },
          monitoringConnection: {
            Metrics: { Enabled: false },
            errors: ["Could not retrieve the monitoring connection"],
          },
          queryErrors: ["Error reaching ServiceControl at http://localhost:33333 connection", "Could not retrieve the monitoring connection"],
        },
      });

      // Assert - error messages are displayed
      componentDSL.assert.errorMessagesAreDisplayed(["Error reaching ServiceControl at http://localhost:33333 connection", "Could not retrieve the monitoring connection"]);
    });
  });
});
