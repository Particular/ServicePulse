<script setup lang="ts">
import { watch, onMounted } from "vue";
import { LicenseStatus } from "@/resources/LicenseInfo";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";
import routeLinks from "@/router/routeLinks";
import { useRouter } from "vue-router";
import { useConfigurationStore } from "@/stores/ConfigurationStore";
import { storeToRefs } from "pinia";
import { useLicenseStore } from "@/stores/LicenseStore";
import LicenseNotificationPopup from "@/components/LicenseNotificationPopup.vue";

const router = useRouter();
const licenseStore = useLicenseStore();
const license = licenseStore.license;

const configurationStore = useConfigurationStore();
const { configuration } = storeToRefs(configurationStore);

function displayWarningMessage(licenseStatus: LicenseStatus) {
  const configurationRootLink = router.resolve(routeLinks.configuration.root).href;
  let type: TYPE.WARNING | TYPE.ERROR;
  switch (licenseStatus) {
    case LicenseStatus.ValidWithExpiredUpgradeProtection:
    case LicenseStatus.ValidWithExpiringTrial:
    case LicenseStatus.ValidWithExpiringSubscription:
    case LicenseStatus.ValidWithExpiringUpgradeProtection:
      type = TYPE.WARNING;
      break;
    case LicenseStatus.InvalidDueToExpiredTrial:
    case LicenseStatus.InvalidDueToExpiredSubscription:
    case LicenseStatus.InvalidDueToExpiredUpgradeProtection:
      type = TYPE.ERROR;
      break;
    default:
      return;
  }
  useShowToast(
    type,
    "",
    {
      component: LicenseNotificationPopup,
      props: {
        type,
        licenseStatus,
        isMassTransitConnector: !!configuration.value?.mass_transit_connector,
        configurationRootLink,
        licenseExtensionUrl: license.license_extension_url,
      },
    },
    true
  );
}

watch(
  () => license.license_status,
  (newValue, oldValue) => {
    const checkForWarnings = newValue !== oldValue;
    if (checkForWarnings) {
      displayWarningMessage(newValue);
    }
  }
);

onMounted(async () => {
  await licenseStore.refresh();
});
</script>
<template>
  <template></template>
</template>
