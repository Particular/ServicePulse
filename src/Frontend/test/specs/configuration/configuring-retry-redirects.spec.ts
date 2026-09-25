import { waitFor } from "@testing-library/vue";
import { expect } from "vitest";
import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import serviceControlClient from "@/components/serviceControlClient";
import monitoringClient from "@/components/monitoring/monitoringClient";
import { clickMonitoringTest, clickSaveConnections, clickServiceControlTest, enterMonitoringConnectionUrl, enterServiceControlConnectionUrl } from "./actions/platformConnections";
import {
  connectionSavedStatus,
  monitoringConnectionFailedStatus,
  monitoringConnectionSuccessfulStatus,
  monitoringConnectionUrlValue,
  monitoringMenuItem,
  monitoringTestButtonDisabled,
  serviceControlConnectionFailedStatus,
  serviceControlConnectionSuccessfulStatus,
  serviceControlConnectionUrlValue,
} from "./questions/platformConnections";

describe("FEATURE: Retry redirects", () => {
  describe("RULE: Existing connection details should be shown", () => {
    test("EXAMPLE: The set ServiceControl connection URL should be displayed", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.goTo("/configuration/connections");
      expect(await serviceControlConnectionUrlValue()).toBe("http://localhost:33333/api/");
    });

    /* SCENARIO
          ServiceControl connection

          Given a ServiceControl connection of http://localhost:33333/api/
          When the page loads
          Then the ServiceControl connection url box should show http://localhost:33333/api
        */
    test("EXAMPLE: The set ServiceControl Monitoring connection URL should be displayed", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.goTo("/configuration/connections");
      expect(await monitoringConnectionUrlValue()).toBe("http://localhost:33633/");
    });
    /* SCENARIO
          ServiceControl Monitoring connection

          Given a ServiceControl Monitoring connection of http://localhost:33633/
          When the page loads
          Then the ServiceControl Monitoring connection url box should show http://localhost:33633/
        */
  });
  describe("RULE: Connection details should be able to be tested", () => {
    test("EXAMPLE: Clicking the ServiceControl 'Test' button with a valid URL should display a success message", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.serviceControlConnectionSucceeds());
      await driver.goTo("/configuration/connections");

      await clickServiceControlTest();

      await waitFor(async () => {
        expect(await serviceControlConnectionSuccessfulStatus()).toBeVisible();
      });
    });

    /* SCENARIO
          Valid ServiceControl connection

          Given a ServiceControl connection to a valid running instance
          When the Test button is clicked
          Then "Connection successful" should be displayed
        */

    test("EXAMPLE: Clicking the ServiceControl 'Test' button with an invalid URL should display a failure message", async ({ driver }) => {
      const invalidServiceControlUrl = "http://localhost:45554/api/";

      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.serviceControlConnectionFailsValidation(invalidServiceControlUrl));
      await driver.goTo("/configuration/connections");

      await enterServiceControlConnectionUrl(invalidServiceControlUrl);
      await clickServiceControlTest();

      await waitFor(async () => {
        expect(await serviceControlConnectionFailedStatus()).toBeVisible();
      });
    });

    test("EXAMPLE: Clicking the ServiceControl 'Test' button with a URL to an instance that isn't running should display a failure message", async ({ driver }) => {
      const unavailableServiceControlUrl = "http://localhost:45555/api/";

      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.serviceControlConnectionUnavailable(unavailableServiceControlUrl));
      await driver.goTo("/configuration/connections");

      await enterServiceControlConnectionUrl(unavailableServiceControlUrl);
      await clickServiceControlTest();

      await waitFor(async () => {
        expect(await serviceControlConnectionFailedStatus()).toBeVisible();
      });
    });
    /* SCENARIO
          Invalid ServiceControl connection

          Given a ServiceControl connection to an invalid or not running instance
          When the Test button is clicked
          Then "Connection failed" should be displayed
        */

    test("EXAMPLE: Clicking the ServiceControl Monitoring 'Test' button with a valid URL should display a success message", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoringConnectionSucceeds());
      await driver.goTo("/configuration/connections");

      await clickMonitoringTest();

      await waitFor(async () => {
        expect(await monitoringConnectionSuccessfulStatus()).toBeVisible();
      });
    });

    /* SCENARIO
          Valid ServiceControl Monitoring connection

          Given a ServiceControl Monitoring connection to a valid running instance
          When the Test button is clicked
          Then "Connection successful" should be displayed
        */

    test("EXAMPLE: Clicking the ServiceControl Monitoring 'Test' button with an invalid URL should display a failure message", async ({ driver }) => {
      const invalidMonitoringUrl = "http://localhost:45554/";

      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoringConnectionFailsValidation(invalidMonitoringUrl));
      await driver.goTo("/configuration/connections");

      await enterMonitoringConnectionUrl(invalidMonitoringUrl);
      await clickMonitoringTest();

      await waitFor(async () => {
        expect(await monitoringConnectionFailedStatus()).toBeVisible();
      });
    });

    test("EXAMPLE: Clicking the ServiceControl Monitoring 'Test' button with a URL to an instance that isn't running should display a failure message", async ({ driver }) => {
      const unavailableMonitoringUrl = "http://localhost:45555/";

      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoringConnectionUnavailable(unavailableMonitoringUrl));
      await driver.goTo("/configuration/connections");

      await enterMonitoringConnectionUrl(unavailableMonitoringUrl);
      await clickMonitoringTest();

      await waitFor(async () => {
        expect(await monitoringConnectionFailedStatus()).toBeVisible();
      });
    });
    /* SCENARIO
          Invalid ServiceControl Monitoring connection

          Given a ServiceControl Monitoring connection to an invalid or not running instance
          When the Test button is clicked
          Then "Connection failed" should be displayed
        */
  });
  describe("RULE: Connection URLs should be able to be saved", () => {
    test("EXAMPLE: Clicking the 'Save' button with a valid running instance should display a success message", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.goTo("/configuration/connections");

      await clickSaveConnections();

      await waitFor(() => {
        expect(connectionSavedStatus()).toBeVisible();
      });
    });

    /* SCENARIO
          Valid ServiceControl connection

          Given a ServiceControl connection to a valid running instance
          When the Save button is clicked
          Then "Connection saved" should be displayed
        */

    test("EXAMPLE: Updating a connection URL and refreshing the page should display the original value", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.goTo("/configuration/connections");

      await enterServiceControlConnectionUrl("http://localhost:44444/api/");
      await driver.goTo("/configuration/connections");

      expect(await serviceControlConnectionUrlValue()).toBe("http://localhost:33333/api/");
    });
    /* SCENARIO
          Not saved

          Given a ServiceControl connection
          When the ServiceControl connection is changed
          And the page is refreshed
          Then the original value is restored
        */
  });
  describe("RULE: The ServiceControl Monitoring URL should be optional", () => {
    test("EXAMPLE: Entering a '!' into the Monitoring connection URL should disable the Test button and remove the Monitoring tab", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.goTo("/configuration/connections");

      const originalLocation = window.location;
      const mockLocation = {
        ...originalLocation,
        search: originalLocation.search,
        hash: originalLocation.hash,
        href: originalLocation.href,
      };

      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      await enterMonitoringConnectionUrl("!");
      expect(await monitoringTestButtonDisabled()).toBe(true);

      await clickSaveConnections();

      await waitFor(() => {
        expect(connectionSavedStatus()).toBeVisible();
      });

      expect(window.location.search).toBe("?scu=http%3A%2F%2Flocalhost%3A33333%2Fapi%2F&mu=%21");

      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
        configurable: true,
      });

      jsdom.reconfigure({ url: `http://localhost:3000/${mockLocation.search}#/configuration/connections` });
      monitoringClient.resetUrl();
      serviceControlClient.resetUrl();

      await driver.goTo("/configuration/connections");
      expect(monitoringMenuItem()).toBeNull();
    });

    /* SCENARIO
          When the Monitoring connection is set to !
          Then the Test button is disabled
          And the Monitoring tab is removed
        */
  });
});
