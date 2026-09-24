<script setup lang="ts">
import { computed } from "vue";
import { TYPE } from "vue-toastification";
import { LicenseStatus } from "@/resources/LicenseInfo";

const props = defineProps<{
  type: TYPE.WARNING | TYPE.ERROR;
  licenseStatus: LicenseStatus;
  isMassTransitConnector: boolean;
  configurationRootLink: string;
  licenseExtensionUrl?: string;
}>();

const heading = computed(() => {
  switch (props.licenseStatus) {
    case LicenseStatus.ValidWithExpiredUpgradeProtection:
      return "Upgrade protection expired";
    case LicenseStatus.ValidWithExpiringTrial:
      return props.isMassTransitConnector ? "Early Access license expiring" : "Non-production development license expiring";
    case LicenseStatus.ValidWithExpiringSubscription:
      return "Platform license expires soon";
    case LicenseStatus.ValidWithExpiringUpgradeProtection:
      return "Upgrade protection expires soon";
    default:
      return "";
  }
});
</script>

<template>
  <div>
    <div class="toast-message" :class="props.type === TYPE.ERROR ? 'toast-error' : 'toast-warning'">
      <p>
        <strong>{{ props.type === TYPE.ERROR ? "Error" : "" }}</strong>
      </p>
      <span v-if="props.type === TYPE.ERROR">Your license has expired. Please contact Particular Software support at: <a href="https://particular.net/support">https://particular.net/support</a></span>
      <div v-else>
        <strong>{{ heading }}</strong>
        <div v-if="props.licenseStatus === LicenseStatus.ValidWithExpiringTrial">
          Your {{ props.isMassTransitConnector ? "Early Access" : "non-production development" }} license will expire soon. To continue using the Particular Service Platform you'll need to extend your license.
        </div>
        <div v-else-if="props.licenseStatus === LicenseStatus.ValidWithExpiringSubscription">Once the license expires you'll no longer be able to continue using the Particular Service Platform.</div>
        <div v-else>Once upgrade protection expires, you'll no longer have access to support or new product versions</div>
        <a v-if="props.licenseStatus === LicenseStatus.ValidWithExpiringTrial" :href="props.licenseExtensionUrl" class="btn btn-warning">Extend your license</a>
        <a :href="props.configurationRootLink" class="btn" :class="props.licenseStatus === LicenseStatus.ValidWithExpiringTrial ? 'btn-light' : 'btn-warning'">View license details</a>
      </div>
    </div>
  </div>
</template>
