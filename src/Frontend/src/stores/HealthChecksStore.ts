import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import type EmailNotifications from "@/resources/EmailNotifications";
import { useEnvironmentAndVersionsStore } from "./EnvironmentAndVersionsStore";
import logger from "@/logger";
import { useAllowedRoutes } from "@/composables/useAllowedRoutes";
import { ApiRoutes } from "@/composables/apiRoutes";

export const useHealthChecksStore = defineStore("HealthChecksStore", () => {
  // Only page-level state is kept here. The email configuration dialog reads and saves the settings it edits itself.
  const emailNotificationsEnabled = ref<boolean | null>(null);

  const environmentStore = useEnvironmentAndVersionsStore();
  const hasResponseStatusInHeaders = environmentStore.serviceControlIsGreaterThan("5.2");

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

  async function toggleEmailNotifications() {
    const previous = emailNotificationsEnabled.value;
    const enabled = !(previous ?? true);
    // Show the new state straight away, so the next toggle sends the opposite value.
    emailNotificationsEnabled.value = enabled;
    const result = await getResponseOrError(() => serviceControlClient.postToServiceControl("notifications/email/toggle", { enabled }));
    if (result.message === "success") return true;
    else {
      logger.error(result.message);
      //set it back to what it was
      emailNotificationsEnabled.value = previous;
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
    canManageNotifications,
    canTestNotifications,
    toggleEmailNotifications,
    testEmailNotifications,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHealthChecksStore, import.meta.hot));
}

export type HealthChecksStore = ReturnType<typeof useHealthChecksStore>;
