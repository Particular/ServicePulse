<script setup>
import { onMounted, ref } from "vue";
import LicenseExpired from "../LicenseExpired.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import { licenseStatus } from "../../composables/serviceLicense";
import { connectionState } from "../../composables/serviceServiceControl";
import HealthCheckNotifications_EmailConfiguration from "./HealthCheckNotifications_ConfigureEmail.vue";
import { useEmailNotifications, useTestEmailNotifications, useToggleEmailNotifications, useUpdateEmailNotifications } from "../../composables/serviceNotifications";
import { useShowToast } from "../../composables/toast";

// This is needed because the ConfigurationView.vue routerView expects this event.
// The event is only actually emitted on the RetryRedirects.vue component
// but if we don't include it, the console will show warnings about not being able to
// subscribe to this event
defineEmits(["redirectCountUpdated"]);

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

async function toggleEmailNotifications() {
  emailTestSuccessful.value = null;
  emailUpdateSuccessful.value = null;
  const result = await useToggleEmailNotifications(emailNotifications.value.enabled === null ? true : !emailNotifications.value.enabled);
  if (result.message === "success") {
    emailToggleSucessful.value = true;
  } else {
    emailToggleSucessful.value = false;
    //set it back to what it was
    emailNotifications.value.enabled = !emailNotifications.value.enabled;
  }
}

function editEmailNotifications() {
  emailToggleSucessful.value = null;
  emailTestSuccessful.value = null;
  emailUpdateSuccessful.value = null;
  showEmailConfiguration.value = true;
}

async function saveEditedEmailNotifications(newSettings) {
  emailUpdateSuccessful.value = null;
  showEmailConfiguration.value = false;
  const result = await useUpdateEmailNotifications(newSettings);
  if (result.message === "success") {
    emailUpdateSuccessful.value = true;
    useShowToast("info", "Info", "Email settings updated.");
    emailNotifications.value.enable_tls = newSettings.enable_tls;
    emailNotifications.value.smtp_server = newSettings.smtp_server;
    emailNotifications.value.smtp_port = newSettings.smtp_port;
    emailNotifications.value.authentication_account = newSettings.authorization_account;
    emailNotifications.value.authentication_password = newSettings.authorization_password;
    emailNotifications.value.from = newSettings.from;
    emailNotifications.value.to = newSettings.to;
  } else {
    emailUpdateSuccessful.value = false;
    useShowToast("Error", "Error", "Failed to update the email settings.");
  }
}

async function testEmailNotifications() {
  emailTestInProgress.value = true;
  emailToggleSucessful.value = null;
  emailUpdateSuccessful.value = null;
  const result = await useTestEmailNotifications();
  if (result.message === "success") {
    emailTestSuccessful.value = true;
  } else {
    emailTestSuccessful.value = false;
  }
  emailTestInProgress.value = false;
}

async function getEmailNotifications() {
  showEmailConfiguration.value = false;
  const result = await useEmailNotifications();
  emailNotifications.value.enabled = result.enabled;
  emailNotifications.value.enable_tls = result.enable_tls;
  emailNotifications.value.smtp_server = result.smtp_server ? result.smtp_server : "";
  emailNotifications.value.smtp_port = result.smtp_port ? result.smtp_port : undefined;
  emailNotifications.value.authentication_account = result.authentication_account ? result.authentication_account : "";
  emailNotifications.value.authentication_password = result.authentication_password ? result.authentication_password : "";
  emailNotifications.value.from = result.from ? result.from : "";
  emailNotifications.value.to = result.to ? result.to : "";
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
            <div class="col-12">
              <p class="screen-intro">Configure notifications for health checks built into ServiceControl (low disk space, stale database indexes, audit ingestion, etc.).</p>
            </div>
          </div>
          <div class="notifications row">
            <div class="col-12">
              <div class="row box box-no-click">
                <div class="col-12 no-side-padding">
                  <div class="row">
                    <div class="col-1">
                      <div class="onoffswitch">
                        <input type="checkbox" id="onoffswitch" name="onoffswitch" class="onoffswitch-checkbox" @click="toggleEmailNotifications" v-model="emailNotifications.enabled" />
                        <label class="onoffswitch-label" for="onoffswitch">
                          <span class="onoffswitch-inner"></span>
                          <span class="onoffswitch-switch"></span>
                        </label>
                      </div>
                      <div>
                        <span class="connection-test connection-failed">
                          <template v-if="emailToggleSucessful === false"> <i class="fa fa-exclamation-triangle"></i> Update failed </template>
                        </span>
                      </div>
                    </div>
                    <div class="col-xs-9 col-sm-10 col-lg-11">
                      <div class="row box-header">
                        <div class="col-12">
                          <p class="lead">Email notifications</p>
                          <p class="endpoint-metadata">
                            <button class="btn btn-link btn-sm" type="button" @click="editEmailNotifications"><i class="fa fa-edit"></i>Configure</button>
                          </p>
                          <p class="endpoint-metadata">
                            <button class="btn btn-link btn-sm" type="button" @click="testEmailNotifications" :disabled="emailTestInProgress"><i class="fa fa-envelope"></i>Send test notification</button>
                            <span class="connection-test connection-testing">
                              <template v-if="emailTestInProgress">
                                <i class="glyphicon glyphicon-refresh rotate"></i>
                                Testing
                              </template>
                            </span>
                            <span class="connection-test connection-successful">
                              <template v-if="emailTestSuccessful === true"> <i class="fa fa-check"></i> Test email sent successfully </template>
                            </span>
                            <span class="connection-test connection-failed">
                              <template v-if="emailTestSuccessful === false"> <i class="fa fa-exclamation-triangle"></i> Test failed </template>
                            </span>
                            <span class="connection-test connection-successful">
                              <template v-if="emailUpdateSuccessful === true"> <i class="fa fa-check"></i> Update successful </template>
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
        <HealthCheckNotifications_EmailConfiguration v-if="showEmailConfiguration === true" v-bind="emailNotifications" @cancel="showEmailConfiguration = false" @save="saveEditedEmailNotifications"> </HealthCheckNotifications_EmailConfiguration>
      </Teleport>
    </section>
  </template>
</template>

<style>
@import "../list.css";

.screen-intro {
  margin: 30px 0;
}

.onoffswitch {
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  width: 76px;
}

.onoffswitch-checkbox {
  display: none;
}

.onoffswitch-label {
  border: 2px solid #929e9e;
  border-radius: 20px;
  cursor: pointer;
  display: block;
  margin-top: 8px;
  overflow: hidden;
}

.onoffswitch-inner {
  display: block;
  margin-left: -100%;
  transition: margin 0.3s ease-in 0s;
  width: 200%;
}

.onoffswitch-inner:before,
.onoffswitch-inner:after {
  box-sizing: border-box;
  color: white;
  display: block;
  float: left;
  font-family: Trebuchet, Arial, sans-serif;
  font-size: 14px;
  font-weight: bold;
  height: 30px;
  line-height: 30px;
  padding: 0;
  width: 50%;
}

.onoffswitch-inner:before {
  background-color: #00a3c4;
  color: #ffffff;
  content: "ON";
  padding-left: 10px;
}

.onoffswitch-inner:after {
  background-color: #f2f6f7;
  color: #929e9e;
  content: "OFF";
  padding-right: 10px;
  text-align: right;
}

.onoffswitch-switch {
  background: #ffffff;
  border: 2px solid #929e9e;
  border-radius: 20px;
  bottom: 0;
  display: block;
  margin: 6px;
  position: absolute;
  right: 42px;
  top: 0;
  transition: all 0.3s ease-in 0s;
  width: 22px;
}

.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner {
  margin-left: 0;
}

.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-switch {
  right: 0px;
}

.box-header {
  padding-bottom: 3px;
  padding-top: 2px;
}

.box-header ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

p.endpoint-metadata {
  display: inline-block;
  margin-top: 4px;
  padding-right: 30px;
}

.endpoint-metadata button i {
  color: #00a3c4;
  margin-right: 4px;
}

.btn-sm {
  color: #00a3c4;
  font-size: 14px;
  font-weight: bold;
  padding: 0 36px 10px 0;
  text-decoration: none;
}

.notifications .btn-sm {
  padding: 0px;
}

.notifications .connection-test {
  top: 2px;
}
</style>
