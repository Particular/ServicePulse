<script setup lang="ts">
import { LicenseStatus } from "@/resources/LicenseInfo";
import routeLinks from "@/router/routeLinks";
import FAIcon from "@/components/FAIcon.vue";
import { faArrowTurnUp, faPlus } from "@fortawesome/free-solid-svg-icons";
import usePlatformHealthStoreAutoRefresh from "@/composables/usePlatformHealthStoreAutoRefresh";
import { storeToRefs } from "pinia";
import { useConfigurationStore } from "@/stores/ConfigurationStore";
import { useLicenseStore } from "@/stores/LicenseStore";

const { store: platformHealthStore } = usePlatformHealthStoreAutoRefresh();
const licenseStore = useLicenseStore();
const { licenseStatus, license } = licenseStore;
const isIntegrated = window.defaultConfig.isIntegrated;

const configurationStore = useConfigurationStore();
const { configuration } = storeToRefs(configurationStore);
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="connectivity-status">
          <span class="secondary">
            <FAIcon class="footer-icon" :icon="faPlus" />
            <RouterLink :to="routeLinks.configuration.endpointConnection.link">Connect new endpoint</RouterLink>
          </span>

          <span v-if="isIntegrated"> Integrated ServicePulse </span>
          <template v-else>
            <RouterLink v-if="platformHealthStore.outdatedOnly || platformHealthStore.rows.some((row) => row.upgradeAvailable)" :to="routeLinks.platformHealth">
              <FAIcon class="footer-icon" :icon="faArrowTurnUp" />
              Updates available
            </RouterLink>
            <span v-else>Platform up to date</span>
          </template>
        </div>
      </div>
      <template v-if="license.license_status !== LicenseStatus.Unavailable && !configuration?.mass_transit_connector && licenseStatus.isTrialLicense">
        <div class="row trialLicenseBar">
          <div role="status" aria-label="trial license bar information">
            <RouterLink :to="routeLinks.configuration.license.link">{{ license.license_type }} license</RouterLink>, non-production use only
          </div>
        </div>
      </template>
    </div>
  </footer>
</template>

<style scoped>
.footer-icon {
  color: var(--sp-blue);
  margin-right: 4px;
}
</style>
