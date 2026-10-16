<script setup lang="ts">
import routeLinks from "@/router/routeLinks";
import ExternalLink from "@/components/ExternalLink.vue";
import { useLicenseStore } from "@/stores/LicenseStore";
import { upgradeProtectionUnsupportedMessage } from "@/resources/LicenseInfo";

const licenseStore = useLicenseStore();
const { licenseStatus, license } = licenseStore;
</script>

<template>
  <template v-if="licenseStatus.isPlatformExpired">
    <div class="text-center monitoring-no-data">
      <h1>Platform license expired</h1>
      <p>Please update your license to continue using the Particular Service Platform</p>
      <div class="action-toolbar">
        <RouterLink class="btn btn-default btn-primary" :to="routeLinks.configuration.license.link">View license details</RouterLink>
      </div>
    </div>
  </template>
  <template v-if="licenseStatus.isPlatformTrialExpired">
    <div class="text-center monitoring-no-data">
      <h1>License expired</h1>
      <p>To continue using the Particular Service Platform, please extend your license</p>
      <div class="action-toolbar">
        <ExternalLink class="btn btn-default btn-primary" :href="license.license_extension_url" show-icon>Extend your license</ExternalLink>
        <RouterLink class="btn btn-default btn-secondary" :to="routeLinks.configuration.license.link">View license details</RouterLink>
      </div>
    </div>
  </template>
  <template v-if="licenseStatus.isUpgradeProtectionUnsupported">
    <div class="text-center monitoring-no-data">
      <h1>Platform license no longer supported</h1>
      <p>{{ upgradeProtectionUnsupportedMessage }} Please update your license to continue using the Particular Service Platform.</p>
      <div class="action-toolbar">
        <RouterLink class="btn btn-default btn-primary" :to="routeLinks.configuration.license.link">View license details</RouterLink>
      </div>
    </div>
  </template>
</template>
