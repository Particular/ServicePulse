<script setup lang="ts">
import { computed } from "vue";
import { LicenseStatus } from "@/resources/LicenseInfo";
import routeLinks from "@/router/routeLinks";
import { storeToRefs } from "pinia";
import { useConfigurationStore } from "@/stores/ConfigurationStore";
import { useLicenseStore } from "@/stores/LicenseStore";

const licenseStore = useLicenseStore();
const { licenseStatus, license } = licenseStore;

const configurationStore = useConfigurationStore();
const { configuration } = storeToRefs(configurationStore);

const showTrialLicenseBar = computed(() => license.license_status !== LicenseStatus.Unavailable && !configuration.value?.mass_transit_connector && licenseStatus.isTrialLicense);
</script>

<template>
  <footer v-if="showTrialLicenseBar" class="footer">
    <div class="trialLicenseBar" role="status" aria-label="trial license bar information">
      <RouterLink :to="routeLinks.configuration.license.link">{{ license.license_type }} license</RouterLink>, non-production use only
    </div>
  </footer>
</template>
