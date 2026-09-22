import { render, screen } from "@component-test-utils";
import { createTestingPinia } from "@pinia/testing";
import { nextTick } from "vue";
import { describe, expect, test, vi } from "vitest";
import { TYPE } from "vue-toastification";
import LicenseNotifications from "@/components/LicenseNotifications.vue";
import LicenseNotificationPopup from "@/components/LicenseNotificationPopup.vue";
import { useShowToast } from "@/composables/toast";
import { LicenseStatus } from "@/resources/LicenseInfo";
import routeLinks from "@/router/routeLinks";
import { useConfigurationStore } from "@/stores/ConfigurationStore";
import { useLicenseStore } from "@/stores/LicenseStore";

const resolve = vi.hoisted(() => vi.fn(() => ({ href: "#/configuration" })));

vi.mock("vue-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-router")>()),
  useRouter: () => ({ resolve }),
}));
vi.mock("@/composables/toast", () => ({ useShowToast: vi.fn() }));

const extensionUrl = 'https://particular.net/extend-your-trial?p=servicepulse&value="quoted"';

describe("LicenseNotifications", () => {
  test.each([
    {
      status: LicenseStatus.ValidWithExpiringTrial,
      isMassTransitConnector: false,
      heading: "Non-production development license expiring",
      body: "Your non-production development license will expire soon. To continue using the Particular Service Platform you'll need to extend your license.",
    },
    {
      status: LicenseStatus.ValidWithExpiringTrial,
      isMassTransitConnector: true,
      heading: "Early Access license expiring",
      body: "Your Early Access license will expire soon. To continue using the Particular Service Platform you'll need to extend your license.",
    },
    {
      status: LicenseStatus.ValidWithExpiredUpgradeProtection,
      isMassTransitConnector: false,
      heading: "Upgrade protection expired",
      body: "Once upgrade protection expires, you'll no longer have access to support or new product versions",
    },
    {
      status: LicenseStatus.ValidWithExpiringUpgradeProtection,
      isMassTransitConnector: false,
      heading: "Upgrade protection expires soon",
      body: "Once upgrade protection expires, you'll no longer have access to support or new product versions",
    },
    {
      status: LicenseStatus.ValidWithExpiringSubscription,
      isMassTransitConnector: false,
      heading: "Platform license expires soon",
      body: "Once the license expires you'll no longer be able to continue using the Particular Service Platform.",
    },
  ])("renders a persistent warning for $heading", async ({ status, isMassTransitConnector, heading, body }) => {
    const { licenseStore } = renderNotifications(isMassTransitConnector);
    licenseStore.license.license_status = status;
    await nextTick();

    const { container } = renderNotification(TYPE.WARNING, status);

    expect(screen.getByText(heading)).toBeInTheDocument();
    expect(screen.getByText(body)).toBeInTheDocument();
    expect(container.querySelector(".toast-message.toast-warning")).toBeInTheDocument();
    expect(resolve).toHaveBeenCalledWith(routeLinks.configuration.root);
    const details = screen.getByRole("link", { name: "View license details" });
    expect(details).toHaveAttribute("href", "#/configuration");
    if (status === LicenseStatus.ValidWithExpiringTrial) {
      const extension = screen.getByRole("link", { name: "Extend your license" });
      expect(extension).toHaveAttribute("href", extensionUrl);
      expect(extension).toHaveClass("btn", "btn-warning");
      expect(details).toHaveClass("btn", "btn-light");
      expect(screen.getAllByRole("link")).toEqual([extension, details]);
    } else {
      expect(details).toHaveClass("btn", "btn-warning");
      expect(screen.getAllByRole("link")).toEqual([details]);
    }
  });

  test.each([LicenseStatus.InvalidDueToExpiredTrial, LicenseStatus.InvalidDueToExpiredSubscription, LicenseStatus.InvalidDueToExpiredUpgradeProtection])("renders a persistent error for %s", async (status) => {
    const { licenseStore } = renderNotifications();
    licenseStore.license.license_status = status;
    await nextTick();

    const { container } = renderNotification(TYPE.ERROR, status);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Your license has expired. Please contact Particular Software support at:")).toBeInTheDocument();
    expect(container.querySelector(".toast-message.toast-error")).toBeInTheDocument();
    const support = screen.getByRole("link", { name: "https://particular.net/support" });
    expect(support).toHaveAttribute("href", "https://particular.net/support");
    expect(support).not.toHaveClass("btn");
    expect(screen.getAllByRole("link")).toEqual([support]);
  });

  test("does not notify for valid or unavailable licenses", async () => {
    const { licenseStore } = renderNotifications();
    licenseStore.license.license_status = LicenseStatus.Valid;
    await nextTick();
    licenseStore.license.license_status = LicenseStatus.Unavailable;
    await nextTick();

    expect(useShowToast).not.toHaveBeenCalled();
  });

  test("only notifies on status changes and keeps existing notification snapshots", async () => {
    const { licenseStore, configurationStore } = renderNotifications(true);
    licenseStore.license.license_status = LicenseStatus.ValidWithExpiringTrial;
    await nextTick();
    const { container } = renderNotification(TYPE.WARNING, LicenseStatus.ValidWithExpiringTrial);

    licenseStore.license.license_extension_url = "https://example.com/new-extension";
    configurationStore.configuration = null;
    licenseStore.license.license_status = LicenseStatus.ValidWithExpiringTrial;
    await nextTick();
    expect(useShowToast).toHaveBeenCalledTimes(1);

    licenseStore.license.license_status = LicenseStatus.ValidWithExpiringSubscription;
    await nextTick();
    expect(useShowToast).toHaveBeenCalledTimes(2);
    expect(container).toHaveTextContent("Early Access license expiring");
    expect(screen.getByRole("link", { name: "Extend your license" })).toHaveAttribute("href", extensionUrl);
  });
});

function renderNotifications(isMassTransitConnector = false) {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      ConfigurationStore: { configuration: isMassTransitConnector ? { mass_transit_connector: {} } : null },
    },
  });
  const licenseStore = useLicenseStore(pinia);
  const configurationStore = useConfigurationStore(pinia);
  licenseStore.license.license_extension_url = extensionUrl;
  render(LicenseNotifications, { global: { plugins: [pinia] } });
  expect(licenseStore.refresh).toHaveBeenCalledTimes(1);
  expect(useShowToast).not.toHaveBeenCalled();
  return { licenseStore, configurationStore };
}

function renderNotification(type: TYPE, licenseStatus: LicenseStatus) {
  expect(useShowToast).toHaveBeenCalledTimes(1);
  expect(useShowToast).toHaveBeenCalledWith(type, "", { component: LicenseNotificationPopup, props: expect.objectContaining({ type, licenseStatus }) }, true);
  const content = vi.mocked(useShowToast).mock.calls[0]?.[2];
  if (!content || typeof content === "string") {
    throw new Error("Expected a license notification component");
  }
  return render(LicenseNotificationPopup, { props: content.props as unknown as InstanceType<typeof LicenseNotificationPopup>["$props"] });
}
