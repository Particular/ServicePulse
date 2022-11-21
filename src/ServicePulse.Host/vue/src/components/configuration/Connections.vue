<script setup>
import { ref, inject } from "vue";
import { useRoute } from "vue-router";
import PlatformLicenseExpired from "../PlatformLicenseExpired.vue";
import PlatformTrialExpired from "../PlatformTrialExpired.vue";
import PlatformProtectionExpired from "../PlatformProtectionExpired.vue";
import {
  key_ServiceControlUrl,
  key_MonitoringUrl,
  key_IsPlatformExpired,
  key_IsPlatformTrialExpired,
  key_IsInvalidDueToUpgradeProtectionExpired,
  key_UpdateConnections,
  key_UnableToConnectToServiceControl,
  key_UnableToConnectToMonitoring,
} from "./../../composables/keys.js";

const configuredServiceControlUrl = inject(key_ServiceControlUrl);
const configuredMonitoringUrl = inject(key_MonitoringUrl);
const updateConnections = inject(key_UpdateConnections);

const serviceControlUrl = ref(configuredServiceControlUrl.value);
const monitoringUrl = ref(configuredMonitoringUrl.value);

const unableToConnectToServiceControl = inject(
  key_UnableToConnectToServiceControl
);
const unableToConnectToMonitoring = inject(key_UnableToConnectToMonitoring);

const isPlatformExpired = inject(key_IsPlatformExpired);
const isPlatformTrialExpired = inject(key_IsPlatformTrialExpired);
const isInvalidDueToUpgradeProtectionExpired = inject(
  key_IsInvalidDueToUpgradeProtectionExpired
);

const testingServiceControl = ref(false);
const serviceControlValid = ref(null);

const testingMonitoring = ref(false);
const monitoringValid = ref(null);

const connectionSaved = ref(null);
const urlParams = ref(useRoute());

function testServiceControlUrl(event) {
  if (event) {
    testingServiceControl.value = true;
    return fetch(serviceControlUrl.value)
      .then(() => {
        serviceControlValid.value = true;
      })
      .catch(() => {
        serviceControlValid.value = false;
      })
      .finally(() => {
        testingServiceControl.value = false;
      });
  }
}

function testMonitoringUrl(event) {
  if (event) {
    testingMonitoring.value = true;
    return fetch(monitoringUrl.value + "monitored-endpoints")
      .then(() => {
        monitoringValid.value = true;
      })
      .catch(() => {
        monitoringValid.value = false;
      })
      .finally(() => {
        testingMonitoring.value = false;
      });
  }
}

function saveConnections(event) {
  if (event) {
    updateConnections(
      urlParams.value,
      serviceControlUrl.value,
      monitoringUrl.value
    );
    connectionSaved.value = true;
  }
}
</script>

<template>
  <PlatformLicenseExpired :isPlatformExpired="isPlatformExpired" />
  <PlatformTrialExpired :isPlatformTrialExpired="isPlatformTrialExpired" />
  <PlatformProtectionExpired
    :isInvalidDueToUpgradeProtectionExpired="
      isInvalidDueToUpgradeProtectionExpired
    "
  />

  <template
    v-if="
      !isPlatformTrialExpired &&
      !isPlatformExpired &&
      !isInvalidDueToUpgradeProtectionExpired
    "
  >
    <section name="connections">
      <div class="box">
        <div class="row">
          <div class="col-sm-12">
            <form novalidate>
              <div class="row connection">
                <h3>ServiceControl</h3>
                <div class="col-sm-7 form-group">
                  <label for="serviceControlUrl"
                    >CONNECTION URL
                    <template v-if="unableToConnectToServiceControl">
                      <span class="failed-validation">
                        <i class="fa fa-exclamation-triangle"></i> Unable to
                        connect</span
                      >
                    </template>
                  </label>
                  <input
                    type="text"
                    id="serviceControlUrl"
                    name="serviceControlUrl"
                    v-model="serviceControlUrl"
                    class="form-control"
                    style="color: #000"
                    required
                  />
                </div>

                <div class="col-sm-5 no-side-padding">
                  <button
                    class="btn btn-default btn-secondary btn-connection-test"
                    :class="{ disabled: !configuredServiceControlUrl }"
                    type="button"
                    @click="testServiceControlUrl"
                  >
                    Test
                  </button>
                  <span
                    class="connection-test connection-testing"
                    v-if="testingServiceControl"
                    ><i class="glyphicon glyphicon-refresh rotate"></i>
                    Testing</span
                  >
                  <span
                    class="connection-test connection-successful"
                    v-if="
                      serviceControlValid === true && !testingServiceControl
                    "
                    ><i class="fa fa-check"></i> Connection successful</span
                  >
                  <span
                    class="connection-test connection-failed"
                    v-if="
                      serviceControlValid === false && !testingServiceControl
                    "
                    ><i class="fa fa-exclamation-triangle"></i> Connection
                    failed</span
                  >
                </div>
              </div>

              <div class="row connection">
                <h3>ServiceControl Monitoring</h3>
                <div class="col-sm-7 form-group">
                  <label for="monitoringUrl"
                    >CONNECTION URL
                    <span class="auxilliary-label">(OPTIONAL)</span>
                    <template v-if="unableToConnectToMonitoring">
                      <span class="failed-validation">
                        <i class="fa fa-exclamation-triangle"></i> Unable to
                        connect
                      </span>
                    </template>
                  </label>
                  <input
                    type="text"
                    id="monitoringUrl"
                    name="monitoringUrl"
                    v-model="monitoringUrl"
                    class="form-control"
                    required
                  />
                </div>

                <div class="col-sm-5 no-side-padding">
                  <button
                    class="btn btn-default btn-secondary btn-connection-test"
                    :class="{ disabled: !configuredMonitoringUrl }"
                    type="button"
                    @click="testMonitoringUrl"
                  >
                    Test
                  </button>
                  <span
                    class="connection-test connection-testing"
                    v-if="testingMonitoring"
                    ><i class="glyphicon glyphicon-refresh rotate"></i>
                    Testing</span
                  >
                  <span
                    class="connection-test connection-successful"
                    v-if="monitoringValid === true && !testingMonitoring"
                    ><i class="fa fa-check"></i> Connection successful</span
                  >
                  <span
                    class="connection-test connection-failed"
                    v-if="monitoringValid === false && !testingMonitoring"
                    ><i class="fa fa-exclamation-triangle"></i> Connection
                    failed</span
                  >
                </div>
              </div>

              <button
                class="btn btn-primary"
                type="button"
                @click="saveConnections"
              >
                Save
              </button>
              <span
                class="connection-test connection-successful hide"
                v-show="connectionSaved"
                ><i class="fa fa-check"></i>Connection saved</span
              >
              <span
                class="connection-test connection-failed hide"
                v-show="!connectionSaved"
                ><i class="fa fa-exclamation-triangle"></i> Unable to save</span
              >
            </form>
          </div>
        </div>
      </div>
    </section>
  </template>
</template>
