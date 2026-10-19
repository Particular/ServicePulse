import type EmailSettings from "@/components/configuration/EmailSettings";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import type EmailNotifications from "@/resources/EmailNotifications";
import type UpdateEmailNotificationsSettingsRequest from "@/resources/UpdateEmailNotificationsSettingsRequest";
import { useEnvironmentAndVersionsStore } from "./EnvironmentAndVersionsStore";
import logger from "@/logger";
import { useAllowedRoutes } from "@/composables/useAllowedRoutes";
import { ApiRoutes } from "@/composables/apiRoutes";

export const useHealthChecksStore = defineStore("HealthChecksStore", () => {
  // Only page-level state is kept here. The settings the dialog edits are loaded with loadEmailSettings() each
  // time it opens, and are not kept.
  const emailNotificationsEnabled = ref<boolean | null>(null);

  const environmentStore = useEnvironmentAndVersionsStore();
  const hasResponseStatusInHeaders = environmentStore.serviceControlIsGreaterThan("5.2");
  const smtpPasswordIsWriteOnly = environmentStore.serviceControlIsGreaterThan("6.21.2");

  const { canCall } = useAllowedRoutes();
  const canManageNotifications = computed(() => canCall(ApiRoutes.manageNotifications));
  const canTestNotifications = computed(() => canCall(ApiRoutes.testNotifications));

  async function refresh() {
    try {
      const [, data] = await serviceControlClient.fetchTypedFromServiceControl<EmailNotifications>("notifications/email");
      emailNotificationsEnabled.value = data.enabled;
    } catch (err) {
      logger.error(err);
      emailNotificationsEnabled.value = false;
    }
  }

  async function loadEmailSettings(): Promise<EmailSettings | null> {
    try {
      const [, data] = await serviceControlClient.fetchTypedFromServiceControl<EmailNotifications>("notifications/email");
      // ServiceControl versions before 6.21.2 also return the SMTP password. It is not copied.
      return {
        enable_tls: data.enable_tls,
        smtp_server: data.smtp_server ?? "",
        smtp_port: data.smtp_port || null,
        authentication_account: data.authentication_account ?? "",
        from: data.from ?? "",
        to: data.to ?? "",
      };
    } catch (err) {
      logger.error(err);
      return null;
    }
  }

  async function toggleEmailNotifications() {
    const result = await getResponseOrError(() =>
      serviceControlClient.postToServiceControl("notifications/email/toggle", {
        enabled: !(emailNotificationsEnabled.value ?? true),
      })
    );
    if (result.message === "success") return true;
    else {
      logger.error(result.message);
      //set it back to what it was
      emailNotificationsEnabled.value = !emailNotificationsEnabled.value;
      return false;
    }
  }

  async function testEmailNotifications() {
    const result = await getResponseOrError(
      () => serviceControlClient.postToServiceControl("notifications/email/test"),
      (response) => (hasResponseStatusInHeaders.value ? (response.headers.get("X-Particular-Reason") ?? response.statusText) : response.statusText)
    );
    if (result.message === "success") return true;
    else {
      logger.error(result.message);
      return false;
    }
  }

  async function saveEmailNotifications(newSettings: UpdateEmailNotificationsSettingsRequest) {
    const result = await getResponseOrError(async () => serviceControlClient.postToServiceControl("notifications/email", await keepStoredPassword(newSettings)));
    if (result.message === "success") {
      return true;
    } else {
      logger.error(result.message);
      return false;
    }
  }

  // An empty password means "keep the stored password". ServiceControl 6.21.2 and later do this themselves. Earlier
  // versions replace the stored password with the empty one, so the stored password is read and sent back with
  // the request instead. It is not kept after the request.
  async function keepStoredPassword(newSettings: UpdateEmailNotificationsSettingsRequest) {
    if (smtpPasswordIsWriteOnly.value || newSettings.authorization_password || !newSettings.authorization_account) {
      return newSettings;
    }
    const [, stored] = await serviceControlClient.fetchTypedFromServiceControl<EmailNotifications>("notifications/email");
    return { ...newSettings, authorization_password: stored.authentication_password ?? "" };
  }

  async function getResponseOrError(action: () => Promise<Response>, responseStatusTextOverride?: (response: Response) => string) {
    const responseStatusTextDefault = (response: Response) => response.statusText;
    const responseStatusText = responseStatusTextOverride ?? responseStatusTextDefault;
    try {
      const response = await action();
      return {
        message: response.ok ? "success" : `error:${responseStatusText(response)}`,
      };
    } catch (err) {
      return {
        message: (err as Error).message ?? err,
      };
    }
  }

  return {
    refresh,
    emailNotificationsEnabled,
    loadEmailSettings,
    canManageNotifications,
    canTestNotifications,
    toggleEmailNotifications,
    saveEmailNotifications,
    testEmailNotifications,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHealthChecksStore, import.meta.hot));
}

export type HealthChecksStore = ReturnType<typeof useHealthChecksStore>;
