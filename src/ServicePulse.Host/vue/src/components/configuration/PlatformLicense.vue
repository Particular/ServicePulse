<script setup>
import { computed } from "vue";
import {
  license,
  useLicenseStatus,
} from "./../../composables/serviceLicense.js";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import { connectionState } from "../../composables/serviceServiceControl";
import BusyIndicator from "../BusyIndicator.vue";
import ExclamationMark from "./../../components/ExclamationMark.vue";

const loading = computed(() => {
  return !license;
});
</script>

<template>
  <section name="license">
    <ServiceControlNotAvailable />
    <template v-if="!connectionState.unableToConnect">
      <section>
        <busy-indicator v-if="loading"></busy-indicator>

        <template v-if="!loading">
          <div class="box">
            <div class="row">
              <div class="license-info">
                <div>
                  <b>Platform license type:</b> {{ license.license_type
                  }}{{ license.licenseEdition.value }}
                </div>

                <template v-if="useLicenseStatus.isSubscriptionLicense">
                  <div>
                    <b>License expiry date: </b>
                    <span
                      :class="{
                        'license-expired': useLicenseStatus.isPlatformExpired,
                      }"
                    >
                      {{ license.formattedExpirationDate.value }}
                      {{ useLicenseStatus.subscriptionDaysLeft }}
                      <exclamation-mark :type="useLicenseStatus.warningLevel" />
                    </span>
                    <div
                      class="license-expired-text"
                      v-if="useLicenseStatus.isPlatformExpired"
                    >
                      Your license expired. Please update the license to
                      continue using the Particular Service Platform.
                    </div>
                  </div>
                </template>
                <template v-if="useLicenseStatus.isTrialLicense">
                  <div>
                    <b>License expiry date: </b>
                    <span
                      :class="{
                        'license-expired':
                          useLicenseStatus.isPlatformTrialExpired,
                      }"
                    >
                      {{ license.formattedExpirationDate.value }}
                      {{ useLicenseStatus.trialDaysLeft }}
                      <exclamation-mark :type="useLicenseStatus.warningLevel" />
                    </span>
                    <div
                      class="license-expired-text"
                      v-if="useLicenseStatus.isPlatformTrialExpired"
                    >
                      Your license expired. To continue using the Particular
                      Service Platform you'll need to extend your license.
                    </div>
                    <div
                      class="license-page-extend-trial"
                      v-if="
                        useLicenseStatus.isPlatformTrialExpiring &&
                        useLicenseStatus.isPlatformTrialExpired
                      "
                    >
                      <a
                        class="btn btn-default btn-primary"
                        href="https://particular.net/extend-your-trial?p=servicepulse"
                        target="_blank"
                        >Extend your license&nbsp;&nbsp;<i
                          class="fa fa-external-link"
                        ></i
                      ></a>
                    </div>
                  </div>
                </template>
                <template v-if="useLicenseStatus.isUpgradeProtectionLicense">
                  <div>
                    <span>
                      <b>Upgrade protection expiry date:</b>
                      <span
                        :class="{
                          'license-expired':
                            useLicenseStatus.isInvalidDueToUpgradeProtectionExpired,
                        }"
                      >
                        {{ license.formattedUpgradeProtectionExpiration.value }}
                        {{ useLicenseStatus.upgradeDaysLeft }}
                        <exclamation-mark
                          :type="useLicenseStatus.warningLevel"
                        />
                      </span>
                    </span>
                    <div
                      class="license-expired-text"
                      v-if="
                        useLicenseStatus.isValidWithExpiredUpgradeProtection ||
                        useLicenseStatus.isValidWithExpiringUpgradeProtection
                      "
                    >
                      <b>Warning:</b> Once upgrade protection expires, you'll no
                      longer have access to support or new product versions.
                    </div>
                    <div
                      class="license-expired-text"
                      v-if="
                        useLicenseStatus.isInvalidDueToUpgradeProtectionExpired
                      "
                    >
                      Your license upgrade protection expired before this
                      version of ServicePulse was released.
                    </div>
                  </div>
                </template>
                <div>
                  <b>ServiceControl instance:</b>
                  {{ license.formattedInstanceName.value }}
                </div>
                <ul class="license-install-info">
                  <li>
                    <a
                      href="https://docs.particular.net/servicecontrol/license"
                      target="_blank"
                      >Install or update a ServiceControl license</a
                    >
                  </li>
                </ul>

                <div class="need-help">
                  Need help?
                  <a href="https://particular.net/contactus">Contact us</a>
                  <i class="fa fa-external-link fake-link"></i>
                </div>
              </div>
            </div>
          </div>
        </template>
      </section>
    </template>
  </section>
</template>

<style></style>
