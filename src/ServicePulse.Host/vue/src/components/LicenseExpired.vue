<script setup>
import { useLicenseStatus } from "./../composables/serviceLicense.js";
</script>

<template>
  <template v-if="useLicenseStatus.isPlatformExpired">
    <div class="text-center monitoring-no-data" style="max-width: 620px">
      <h1>Platform license expired</h1>
      <p>
        Please update your license to continue using the Particular Service
        Platform
      </p>
      <div class="action-toolbar">
        <a class="btn btn-default btn-primary" href="/configuration#license"
          >View license details</a
        >
      </div>
    </div>
  </template>
  <template v-if="useLicenseStatus.isPlatformTrialExpired">
    <div class="text-center monitoring-no-data" style="max-width: 720px">
      <h1>License expired</h1>
      <p>
        To continue using the Particular Service Platform, please extend your
        license
      </p>
      <div class="action-toolbar">
        <a
          class="btn btn-default btn-primary"
          href="https://particular.net/extend-your-trial?p=servicepulse"
          target="_blank"
          >Extend your license <i class="fa fa-external-link"></i
        ></a>
        <a class="btn btn-default btn-secondary" href="/configuration#license"
          >View license details</a
        >
      </div>
    </div>
  </template>
  <template v-if="useLicenseStatus.isInvalidDueToUpgradeProtectionExpired">
    <div class="text-center monitoring-no-data" style="max-width: 620px">
      <h1>Platform license expired</h1>
      <p>
        Your upgrade protection period has elapsed and your license is not valid
        for this version of ServicePulse.
      </p>
      <div class="action-toolbar">
        <a class="btn btn-default btn-primary" href="/configuration#license"
          >View license details</a
        >
      </div>
    </div>
  </template>
</template>
