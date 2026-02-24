import { test, describe } from "../../drivers/vitest/driver";
import { expect, vi } from "vitest";
import * as precondition from "../../preconditions";
import { waitFor } from "@testing-library/vue";
import { endpointConfigurationOnlyTab, jsonFileTab, isTabActive, clickTab, getCodeEditorContent, waitForCodeEditorContent, clickCopyButton } from "./questions/endpointConnection";

describe("FEATURE: Endpoint connection", () => {
  describe("RULE: Examples should match the current configuration", () => {
    test("EXAMPLE: The 'Endpoint Configuration Only' tab should be selected by default", async ({ driver }) => {
      /* SCENARIO
     Given the user navigates to the endpoint connection page
     When the page loads
     Then the 'Endpoint Configuration Only' tab should be selected by default
     And the 'JSON File' tab should not be selected
   */

      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasServiceControlConnection());
      await driver.setUp(precondition.hasMonitoringConnection());

      // Act - navigate to the endpoint connection configuration page
      await driver.goTo("/configuration/endpoint-connection");

      // Assert - wait for the tabs to load
      await waitFor(async () => {
        const endpointTab = await endpointConfigurationOnlyTab();
        expect(endpointTab).toBeInTheDocument();
      });

      // Assert - "Endpoint Configuration Only" tab should be active
      const endpointTab = await endpointConfigurationOnlyTab();
      expect(isTabActive(endpointTab)).toBe(true);

      // Assert - "JSON File" tab should not be active
      const jsonTab = await jsonFileTab();
      expect(isTabActive(jsonTab)).toBe(false);
    });

    test("EXAMPLE: The 'Endpoint Configuration Only' tab should display endpoint configuration examples for the current configuration", async ({ driver }) => {
      /* SCENARIO
     Given the user is on the endpoint connection page with specific configuration
     And the 'Endpoint Configuration Only' tab is selected
     Then the code editor should display inline configuration code
     And the content should match the configuration that was set
   */

      // Arrange - Define the expected configuration
      const expectedServiceControlConfig = {
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

      // Set up preconditions with the expected configuration
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasServiceControlConnection(expectedServiceControlConfig as never));
      await driver.setUp(precondition.hasMonitoringConnection(expectedMonitoringConfig));

      // Act
      await driver.goTo("/configuration/endpoint-connection");

      // Assert - wait for content to load
      await waitFor(async () => {
        const content = await getCodeEditorContent();
        expect(content).toBeTruthy();
      });

      // Get the actual content
      const content = await getCodeEditorContent();

      // Debug: Verify we got the full content
      expect(content.length).toBeGreaterThan(0);

      // Assert - verify the content contains the expected structure
      expect(content).toContain("ServicePlatformConnectionConfiguration.Parse");

      // Verify each section of the configuration is present with escaped quotes
      // Heartbeats section
      expect(content).toContain('""Heartbeats""');
      expect(content).toContain('""HeartbeatsQueue"": ""Particular.ServiceControl@XXX""');
      expect(content).toContain('""Frequency"": ""00:00:10""');
      expect(content).toContain('""TimeToLive"": ""00:00:40""');

      // CustomChecks section
      expect(content).toContain('""CustomChecks""');
      expect(content).toContain('""CustomChecksQueue"": ""Particular.ServiceControl@XXX""');

      // ErrorQueue section (it's a string, not an object)
      expect(content).toContain('""ErrorQueue"": ""error""');

      // SagaAudit section
      expect(content).toContain('""SagaAudit""');
      expect(content).toContain('""SagaAuditQueue"": ""audit""');

      // MessageAudit section
      expect(content).toContain('""MessageAudit""');
      expect(content).toContain('""AuditQueue"": ""audit""');

      // Metrics section
      expect(content).toContain('""Metrics""');
      expect(content).toContain('""MetricsQueue"": ""Particular.Monitoring@XXX""');
      // expect(content).toContain('""Interval"": ""00:00:01""');
      //  expect(content).toContain("ConnectToServicePlatform");
    });

    test("EXAMPLE: The 'JSON File' tab should display JSON file configuration examples for the current configuration", async ({ driver }) => {
      /* SCENARIO
      Given the user is on the endpoint connection page
      When the user clicks on the 'JSON File' tab
      Then the tab should become active
      And the code editor should display JSON file configuration code
      And the code should contain File.ReadAllText
    */

      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasServiceControlConnection());
      await driver.setUp(precondition.hasMonitoringConnection());

      // Act
      await driver.goTo("/configuration/endpoint-connection");

      // Wait for page to load
      await waitFor(async () => {
        const endpointTab = await endpointConfigurationOnlyTab();
        expect(endpointTab).toBeInTheDocument();
      });

      // Act - click on JSON File tab
      const jsonTab = await jsonFileTab();
      expect(jsonTab).toBeInTheDocument();
      clickTab(jsonTab!);

      // Assert - JSON File tab should now be active
      await waitFor(async () => {
        const jsonTabAfterClick = await jsonFileTab();
        expect(isTabActive(jsonTabAfterClick)).toBe(true);
      });

      // Assert - Endpoint Configuration Only tab should not be active
      const endpointTab = await endpointConfigurationOnlyTab();
      expect(isTabActive(endpointTab)).toBe(false);

      // Wait for the code editor to be rendered and have content in the JSON File tab
      // The JSON File tab has 2 code editors: index 0 is the C# snippet, index 1 is the JSON config
      const content = await waitForCodeEditorContent(0, "File.ReadAllText");

      // Assert - verify the content contains expected JSON configuration code
      expect(content).toContain("var json = File.ReadAllText");
      expect(content).toContain("ServicePlatformConnectionConfiguration.Parse(json)");
      expect(content).toContain("endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection)");
    });
  });
  describe("RULE: Copying the example should happen with a single click", () => {
    test("EXAMPLE: Clicking the 'Copy' button in the 'Endpoint Configuration Only' tab should copy the example to the clipboard", async ({ driver }) => {
      /* SCENARIO
     Given the user is on the endpoint connection page
     And the 'Endpoint Configuration Only' tab is selected
     When the user clicks the 'Copy to clipboard' button
     Then the code should be copied to the clipboard
     And the clipboard should contain the inline configuration code
   */

      // Arrange - Mock the clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasServiceControlConnection());
      await driver.setUp(precondition.hasMonitoringConnection());

      // Act - navigate to the page
      await driver.goTo("/configuration/endpoint-connection");

      // Wait for page to load
      await waitFor(async () => {
        const endpointTab = await endpointConfigurationOnlyTab();
        expect(endpointTab).toBeInTheDocument();
      });

      // Wait for code editor content to be available
      const codeContent = await waitForCodeEditorContent(0);
      expect(codeContent).toBeTruthy();

      // Act - click the copy button
      await clickCopyButton();

      // Assert - clipboard writeText was called with the code content
      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledTimes(1);
        expect(writeTextMock).toHaveBeenCalledWith(codeContent);
      });

      // Verify the content contains expected configuration
      expect(codeContent).toContain("ServicePlatformConnectionConfiguration.Parse");
      expect(codeContent).toContain("endpointConfiguration.ConnectToServicePlatform");
    });

    test("EXAMPLE: Clicking the 'Copy' button in the 'JSON File' tab should copy the example to the clipboard", async ({ driver }) => {
      /* SCENARIO
     Given the user is on the endpoint connection page
     When the user clicks on the 'JSON File' tab
     And clicks the 'Copy to clipboard' button for the endpoint configuration section
     Then the code should be copied to the clipboard
     And the clipboard should contain the JSON file configuration code
   */

      // Arrange - Mock the clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasServiceControlConnection());
      await driver.setUp(precondition.hasMonitoringConnection());

      // Act - navigate to the page
      await driver.goTo("/configuration/endpoint-connection");

      // Wait for page to load
      await waitFor(async () => {
        const endpointTab = await endpointConfigurationOnlyTab();
        expect(endpointTab).toBeInTheDocument();
      });

      // Act - switch to JSON File tab
      const jsonTab = await jsonFileTab();
      expect(jsonTab).not.toBeNull();
      await clickTab(jsonTab!);

      // Wait for JSON tab to be active
      await waitFor(async () => {
        const jsonTabAfterClick = await jsonFileTab();
        expect(isTabActive(jsonTabAfterClick)).toBe(true);
      });

      // Note: In JSON File tab, there are multiple code editors
      // The first one shows the endpoint configuration with File.ReadAllText
      // We'll click the first visible copy button

      // Act - click the copy button
      await clickCopyButton();

      // Assert - clipboard writeText was called
      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled();
      });

      // Get the copied content
      const copiedContent = writeTextMock.mock.calls[0][0] as string;
      expect(copiedContent).toBeTruthy();

      // Verify it contains JSON file configuration elements
      expect(copiedContent).toContain("File.ReadAllText");
      expect(copiedContent).toContain("ServicePlatformConnectionConfiguration.Parse");
    });
  });
});
