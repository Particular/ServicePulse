<script setup>
import { ref, onMounted } from "vue";
import LicenseExpired from "../LicenseExpired.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import { licenseStatus } from "../../composables/serviceLicense.js";
import { connectionState } from "../../composables/serviceServiceControl";
import HealthCheckNotifications_EmailConfiguration from "./HealthCheckNotifications_ConfigureEmail.vue";
import {
  useEmailNotifications,
  useUpdateEmailNotifications,
  useTestEmailNotifications,
  useToggleEmailNotifications,
} from "../../composables/serviceNotifications.js";
import { useShowToast } from "../../composables/toast.js";

const isExpired = licenseStatus.isExpired;
const emailTestSuccessful = ref(null);
const emailTestInProgress = ref(null);
const emailToggleSucessful = ref(null);
const emailUpdateSuccessful = ref(null);
const showEmailConfiguration = ref(false);

const emailNotifications = ref({
  enabled: null,
  enable_tls: null,
  smtp_server: "",
  smtp_port: null,
  authentication_account: "",
  authentication_password: "",
  from: "",
  to: "",
});

function toggleEmailNotifications() {
  emailTestSuccessful.value = null;
  emailUpdateSuccessful.value = null;
  useToggleEmailNotifications(
    emailNotifications.value.enabled === null
      ? true
      : !emailNotifications.value.enabled
  ).then((result) => {
    if (result.message === "success") {
      emailToggleSucessful.value = true;
    } else {
      emailToggleSucessful.value = false;
      //set it back to what it was
      emailNotifications.value.enabled = !emailNotifications.value.enabled;
    }
  });
}

function editEmailNotifications() {
  emailToggleSucessful.value = null;
  emailTestSuccessful.value = null;
  emailUpdateSuccessful.value = null;
  showEmailConfiguration.value = true;
}

function saveEditedEmailNotifications(newSettings) {
  emailUpdateSuccessful.value = null;
  showEmailConfiguration.value = false;
  useUpdateEmailNotifications(newSettings).then((result) => {
    if (result.message === "success") {
      emailUpdateSuccessful.value = true;
      useShowToast("info", "Info", "Email settings updated.");
      emailNotifications.value.enable_tls = newSettings.enable_tls;
      emailNotifications.value.smtp_server = newSettings.smtp_server;
      emailNotifications.value.smtp_port = newSettings.smtp_port;
      emailNotifications.value.authentication_account =
        newSettings.authorization_account;
      emailNotifications.value.authentication_password =
        newSettings.authorization_password;
      emailNotifications.value.from = newSettings.from;
      emailNotifications.value.to = newSettings.to;
    } else {
      emailUpdateSuccessful.value = false;
      useShowToast("Error", "Error", "Failed to update the email settings.");
    }
  });
}

function testEmailNotifications() {
  emailTestInProgress.value = true;
  emailToggleSucessful.value = null;
  emailUpdateSuccessful.value = null;
  useTestEmailNotifications().then((result) => {
    if (result.message === "success") {
      emailTestSuccessful.value = true;
    } else {
      emailTestSuccessful.value = false;
    }
    emailTestInProgress.value = false;
  });
}

function getEmailNotifications() {
  showEmailConfiguration.value = false;
  useEmailNotifications().then((result) => {
    emailNotifications.value.enabled = result.enabled;
    emailNotifications.value.enable_tls = result.enable_tls;
    emailNotifications.value.smtp_server = result.smtp_server
      ? result.smtp_server
      : "";
    emailNotifications.value.smtp_port = result.smtp_port
      ? result.smtp_port
      : undefined;
    emailNotifications.value.authentication_account =
      result.authentication_account ? result.authentication_account : "";
    emailNotifications.value.authentication_password =
      result.authentication_password ? result.authentication_password : "";
    emailNotifications.value.from = result.from ? result.from : "";
    emailNotifications.value.to = result.to ? result.to : "";
  });
}

onMounted(() => {
  getEmailNotifications();
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!isExpired">
    <section name="notifications">
      <ServiceControlNotAvailable />
      <template v-if="!connectionState.unableToConnect">
        <section>
          <div class="row">
            <div class="col-sm-12">
              <p class="screen-intro">
                Configure notifications for health checks built into
                ServiceControl (low disk space, stale database indexes, and
                messages in error queue).
              </p>
            </div>
          </div>
          <div class="notifications row">
            <div class="col-sm-12">
              <div class="row box box-no-click">
                <div class="col-sm-12 no-side-padding">
                  <div class="row">
                    <div class="col-xs-1">
                      <div class="onoffswitch">
                        <input
                          type="checkbox"
                          id="onoffswitch"
                          name="onoffswitch"
                          class="onoffswitch-checkbox"
                          @click="toggleEmailNotifications"
                          v-model="emailNotifications.enabled"
                        />
                        <label class="onoffswitch-label" for="onoffswitch">
                          <span class="onoffswitch-inner"></span>
                          <span class="onoffswitch-switch"></span>
                        </label>
                      </div>
                      <div>
                        <span class="connection-test connection-failed">
                          <template v-if="emailToggleSucessful === false">
                            <i class="fa fa-exclamation-triangle"></i> Update
                            failed
                          </template>
                        </span>
                      </div>
                    </div>
                    <div class="col-xs-9 col-sm-10 col-lg-11">
                      <div class="row box-header">
                        <div class="col-xs-12">
                          <p class="lead">Email notifications</p>
                          <p class="endpoint-metadata">
                            <button
                              class="btn btn-link btn-sm"
                              type="button"
                              @click="editEmailNotifications"
                            >
                              <i class="fa fa-edit"></i>Configure
                            </button>
                          </p>
                          <p class="endpoint-metadata">
                            <button
                              class="btn btn-link btn-sm"
                              type="button"
                              @click="testEmailNotifications"
                              :disabled="emailTestInProgress"
                            >
                              <i class="fa fa-envelope"></i>Send test
                              notification
                            </button>
                            <span class="connection-test connection-testing">
                              <template v-if="emailTestInProgress">
                                <i
                                  class="glyphicon glyphicon-refresh rotate"
                                ></i>
                                Testing
                              </template>
                            </span>
                            <span class="connection-test connection-successful">
                              <template v-if="emailTestSuccessful === true">
                                <i class="fa fa-check"></i> Test email sent
                                successfully
                              </template>
                            </span>
                            <span class="connection-test connection-failed">
                              <template v-if="emailTestSuccessful === false">
                                <i class="fa fa-exclamation-triangle"></i> Test
                                failed
                              </template>
                            </span>
                            <span class="connection-test connection-successful">
                              <template v-if="emailUpdateSuccessful === true">
                                <i class="fa fa-check"></i> Update successful
                              </template>
                            </span>
                            <span class="connection-test connection-failed">
                              <template v-if="emailUpdateSuccessful === false">
                                <i class="fa fa-exclamation-triangle"></i>
                                Update failed
                              </template>
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>

      <Teleport to="#modalDisplay">
        <!-- use the modal component, pass in the prop -->
        <HealthCheckNotifications_EmailConfiguration
          v-if="showEmailConfiguration === true"
          v-bind="emailNotifications"
          @cancel="showEmailConfiguration = false"
          @save="saveEditedEmailNotifications"
        >
        </HealthCheckNotifications_EmailConfiguration>
      </Teleport>
    </section>
  </template>
</template>

<style></style>
