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

const showTrialNotice = computed(() => license.license_status !== LicenseStatus.Unavailable && !configuration.value?.mass_transit_connector && licenseStatus.isTrialLicense);
</script>

<template>
  <footer v-if="showTrialNotice" class="trial-license-bar">
    <div role="status" aria-label="trial license bar information">
      <RouterLink :to="routeLinks.configuration.license.link">{{ license.license_type }} license</RouterLink>, non-production use only
    </div>
  </footer>
</template>

<style scoped>
.trial-license-bar {
  flex-shrink: 0;
  padding: 6px 16px;
  background-color: var(--sp-trial);
  color: #fff;
  font-size: 14px;
  text-align: center;
}

.trial-license-bar a {
  color: #fff;
  text-decoration: underline;
}
</style>
