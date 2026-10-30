import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import { waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { flushPromises } from "@vue/test-utils";
import * as precondition from "../../preconditions";
import { useEnvironmentAndVersionsStore } from "@/stores/EnvironmentAndVersionsStore";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";
import { storageOptionsBanner, storageOptionsBannerDescription, storageOptionsDismissButton, storageOptionsLink } from "./questions/storageOptionsBanner";

const serviceControl7 = "7.0.0";
const dismissedStorageKey = "servicepulse-v7-storage-banner-dismissed";

async function dashboardDataHasLoaded() {
  const environmentStore = useEnvironmentAndVersionsStore();
  const platformModelStore = usePlatformModelStore();
  await waitFor(() => {
    expect(environmentStore.environment.sc_version).not.toBe("");
    expect(platformModelStore.model).not.toBeNull();
  });
  await flushPromises();
}

describe("FEATURE: ServiceControl 7 storage options banner", () => {
  describe("RULE: The banner is only shown when ServiceControl is version 7 or later", () => {
    test("EXAMPLE: ServiceControl 6 does not show the banner", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasServiceControlMainInstance("6.21.3"));

      // Act
      await driver.goTo("/");
      await dashboardDataHasLoaded();

      // Assert
      expect(storageOptionsBanner()).toBeNull();
    });

    test("EXAMPLE: ServiceControl 7 shows the banner with a link to the documentation", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasServiceControlMainInstance(serviceControl7));

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(() => expect(storageOptionsBanner()).toBeInTheDocument());
      const banner = storageOptionsBanner()!;
      expect(storageOptionsBannerDescription(banner)).toBe("With the upgrade to v7, ServiceControl now supports Microsoft SQL Server and PostgreSQL providing better performance and more flexibility for cloud deployments.");

      const link = storageOptionsLink(banner);
      expect(link).toHaveAttribute("href", "https://docs.particular.net/servicecontrol/storage");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("RULE: The banner is only shown while the error instance stores its data in RavenDB", () => {
    test("EXAMPLE: An error instance on RavenDB shows the banner", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasServiceControlMainInstance(serviceControl7));
      await driver.setUp(precondition.hasStorageType("RavenDB"));

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(() => expect(storageOptionsBanner()).toBeInTheDocument());
    });

    test("EXAMPLE: An error instance on SQL Server does not show the banner", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasServiceControlMainInstance(serviceControl7));
      await driver.setUp(precondition.hasStorageType("SQLServer"));

      // Act
      await driver.goTo("/");
      await dashboardDataHasLoaded();

      // Assert
      expect(storageOptionsBanner()).toBeNull();
    });

    test("EXAMPLE: An error instance that does not report its storage type is treated as RavenDB", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasServiceControlMainInstance(serviceControl7));

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(() => expect(storageOptionsBanner()).toBeInTheDocument());
    });
  });

  describe("RULE: Dismissing the banner is remembered by the browser", () => {
    test("EXAMPLE: A dismissed banner stays hidden after ServicePulse is reopened", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasServiceControlMainInstance(serviceControl7));
      await driver.goTo("/");
      await waitFor(() => expect(storageOptionsBanner()).toBeInTheDocument());

      // Act
      await userEvent.click(storageOptionsDismissButton(storageOptionsBanner()!));

      // Assert
      await waitFor(() => expect(storageOptionsBanner()).toBeNull());
      expect(localStorage.getItem(dismissedStorageKey)).toBe("true");

      driver.disposeApp();
      await driver.goTo("/");
      await dashboardDataHasLoaded();

      expect(storageOptionsBanner()).toBeNull();
    });

    test("EXAMPLE: A browser that dismissed the banner before does not show it", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasServiceControlMainInstance(serviceControl7));
      localStorage.setItem(dismissedStorageKey, "true");

      // Act
      await driver.goTo("/");
      await dashboardDataHasLoaded();

      // Assert
      expect(storageOptionsBanner()).toBeNull();
    });
  });
});
