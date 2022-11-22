<script setup>
import { inject, ref, computed } from "vue";
import {
  key_IsSCConnected,
  key_IsSCConnecting,
  key_ScConnectedAtLeastOnce,
  key_License,
} from "./../../composables/keys.js";
import {
  useIsSubscriptionLicense,
  useIsExpired,
  useIsExpiring,
  useIsValid,
  useIsUpgradeProtectionLicense,
  useLicenseWarningLevel,
  useUpgradeDaysLeft,
  useExpirationDaysLeft,
} from "./../../composables/serviceLicense.js";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import BusyIndicator from "../BusyIndicator.vue";
import ExclamationMark from "./../../components/ExclamationMark.vue";

const isSCConnected = inject(key_IsSCConnected);
const isSCConnecting = inject(key_IsSCConnecting);
const scConnectedAtLeastOnce = inject(key_ScConnectedAtLeastOnce);
const license = inject(key_License);
const isSubscriptionLicense = ref(useIsSubscriptionLicense(license.value));
const isTrialLicense = ref(license.value.trial_license);
const isExpired = ref(useIsExpired(license.value.license_status));
const isExpiring = ref(useIsExpiring(license.value.license_status));
const isValid = ref(useIsValid(license.value.license_status));
const isUpgradeProtectionLicense = ref(
  useIsUpgradeProtectionLicense(license.value)
);
const expiredWarningType = ref(
  useLicenseWarningLevel(license.value.license_status)
);
const licenseEdition = ref(license.value.licenseEdition);
const instanceName = ref(license.value.formattedInstanceName);

const upgradeDaysLeft = ref(
  useUpgradeDaysLeft(license.value.upgrade_protection_expiration, isValid.value)
);
const expirationDaysLeft = ref(
  useExpirationDaysLeft(
    license.value.expiration_date,
    isValid.value,
    isExpiring.value
  )
);
const formattedExpirationDate = ref(license.value.formattedExpirationDate);
const formattedUpgradeProtectionExpiration = ref(
  license.value.formattedUpgradeProtectionExpiration
);

const loading = computed(() => {
  return !license;
});
</script>

<template>
  <section name="license">
    <div class="sp-loader" v-if="isSCConnecting"></div>
    <ServiceControlNotAvailable
      :isSCConnected="isSCConnected"
      :isSCConnecting="isSCConnecting"
      :scConnectedAtLeastOnce="scConnectedAtLeastOnce"
    />

    <template v-if="isSCConnected || scConnectedAtLeastOnce">
      <section>
        <busy-indicator v-if="loading"></busy-indicator>

        <template v-if="!loading">
          <div class="box">
            <div class="row">
              <div class="license-info">
                <div>
                  <b>Platform license type:</b> {{ license.license_type
                  }}{{ licenseEdition }}
                </div>

                <template v-if="isSubscriptionLicense || isTrialLicense">
                  <div>
                    <b>License expiry date: </b>
                    <span :class="{ 'license-expired': isExpired }">
                      {{ formattedExpirationDate }} {{ expirationDaysLeft }}
                      <exclamation-mark :type="expiredWarningType" />
                    </span>
                    <div
                      class="license-expired-text"
                      v-if="isExpired && isSubscriptionLicense"
                    >
                      Your license expired. Please update the license to
                      continue using the Particular Service Platform.
                    </div>
                    <div
                      class="license-expired-text"
                      v-if="isExpired && isTrialLicense"
                    >
                      Your license expired. To continue using the Particular
                      Service Platform you'll need to extend your license.
                    </div>
                    <div
                      class="license-page-extend-trial"
                      v-if="isTrialLicense && (isExpiring || isExpired)"
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
                <template v-if="isUpgradeProtectionLicense">
                  <div>
                    <span>
                      <b>Upgrade protection expiry date:</b>
                      <span :class="{ 'license-expired': !isValid }">
                        {{ formattedUpgradeProtectionExpiration }}
                        {{ upgradeDaysLeft }}
                        <exclamation-mark :type="expiredWarningType" />
                      </span>
                    </span>
                    <div
                      class="license-expired-text"
                      v-if="isValid && (isExpiring || isExpired)"
                    >
                      <b>Warning:</b> Once upgrade protection expires, you'll no
                      longer have access to support or new product versions.
                    </div>
                    <div class="license-expired-text" v-if="!isValid">
                      Your license upgrade protection expired before this
                      version of ServicePulse was released.
                    </div>
                  </div>
                </template>
                <div><b>ServiceControl instance:</b> {{ instanceName }}</div>
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
