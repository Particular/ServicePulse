<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type UpdateEmailNotificationsSettingsRequest from "@/resources/UpdateEmailNotificationsSettingsRequest";
import ModalDialog from "../ModalDialog.vue";
import ActionButton from "../ActionButton.vue";
import ExternalLink from "@/components/ExternalLink.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { useHealthChecksStore } from "@/stores/HealthChecksStore";

const emit = defineEmits<{
  save: [settings: UpdateEmailNotificationsSettingsRequest];
  cancel: [];
}>();

const healthChecksStore = useHealthChecksStore();

const loading = ref(true);
const loadFailed = ref(false);

const smtp_server = ref("");
const smtp_port = ref<number | null>(null);
const authentication_account = ref("");
// Always starts empty: the stored password is never loaded into the form.
const authentication_password = ref("");
const enable_tls = ref<boolean | null>(null);
const from = ref("");
const to = ref("");

// Start the form from what ServiceControl has now, not from what was loaded with the page.
onMounted(async () => {
  const settings = await healthChecksStore.loadEmailSettings();
  if (settings) {
    smtp_server.value = settings.smtp_server;
    smtp_port.value = settings.smtp_port;
    authentication_account.value = settings.authentication_account;
    enable_tls.value = settings.enable_tls;
    from.value = settings.from;
    to.value = settings.to;
  } else {
    loadFailed.value = true;
  }
  loading.value = false;
});

const emailRe = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const smtpServerIsValid = computed(() => {
  return !!smtp_server.value;
});
const smtpPortIsValid = computed(() => {
  return !!(smtp_port.value ?? 0 > 0);
});
const fromIsValid = computed(() => {
  return !!(from.value && emailRe.test(from.value));
});
const toIsValid = computed(() => {
  return !!(to.value && validateMultipleEmailsCommaSeparated(to.value));
});
const formIsValid = computed(() => {
  return smtpServerIsValid.value && smtpPortIsValid.value && fromIsValid.value && toIsValid.value;
});

function validateMultipleEmailsCommaSeparated(value: string) {
  const result = value.split(",");
  return result.every((address) => emailRe.test(address));
}

function save() {
  const updatedSettings: UpdateEmailNotificationsSettingsRequest = {
    smtp_server: smtp_server.value,
    smtp_port: smtp_port.value ?? 0,
    authorization_account: authentication_account.value,
    authorization_password: authentication_password.value,
    enable_tls: enable_tls.value ?? false,
    from: from.value,
    to: to.value,
  };
  emit("save", updatedSettings);
}

function close() {
  emit("cancel");
}
</script>

<template>
  <ModalDialog id="email-config-dialog" title="Email configuration" @close="close" width="800px">
    <template #modalBody>
      <LoadingSpinner v-if="loading" />
      <div v-else-if="loadFailed" class="alert alert-danger" role="alert">The email settings could not be loaded from ServiceControl. Close this dialog and try again.</div>
      <div v-else class="notificationsForm">
        <div class="row">
          <div class="form-group" :class="{ 'has-error': !smtpServerIsValid }">
            <label for="smtpServerAddress">SMTP server address</label>
            <input type="text" id="smtpServerAddress" name="smtpServerAddress" v-model="smtp_server" class="form-control" required />
          </div>
          <div class="row"></div>
          <div class="form-group" :class="{ 'has-error': !smtpPortIsValid }">
            <label for="smtpServerPort">SMTP server port</label>
            <input type="number" id="smtpServerPort" name="smtpServerPort" v-model="smtp_port" class="form-control" required />
          </div>
          <div class="row"></div>
          <div class="form-group">
            <label for="account">Authentication account</label>
            <input type="text" id="account" name="account" v-model="authentication_account" class="form-control" />
          </div>
          <div class="row"></div>
          <div class="form-group">
            <label for="password">Authentication password</label>
            <input type="password" id="password" name="password" v-model="authentication_password" class="form-control" placeholder="Leave empty to keep the stored password" autocomplete="new-password" aria-describedby="passwordHelp" />
            <div id="passwordHelp" class="form-text">The stored password is never shown.</div>
          </div>
          <div class="row"></div>
          <div class="alert alert-info py-2">
            Use a dedicated SMTP account with limited send permissions.
            <ExternalLink href="https://docs.particular.net/servicecontrol/security/smtp-account">Securing the SMTP account</ExternalLink>
          </div>
          <div class="row"></div>
          <div class="form-group">
            <input type="checkbox" id="enableTLS" name="enableTLS" v-model="enable_tls" class="check-label" />
            <label for="enableTLS">Use TLS</label>
          </div>
          <div class="row"></div>
          <div class="form-group" :class="{ 'has-error': !fromIsValid }">
            <label for="from">From address</label>
            <input type="email" id="from" name="from" v-model="from" class="form-control" required />
          </div>
          <div class="row"></div>
          <div class="form-group" :class="{ 'has-error': !toIsValid }">
            <label for="to">To address <br />(Separate multiple email address with a comma. E.g. testing@test.com,testing2@test.com)</label>
            <input type="email" id="to" name="to" v-model="to" class="form-control" required />
          </div>
        </div>
      </div>
    </template>
    <template #modalFooter>
      <ActionButton variant="primary" :disabled="loading || loadFailed || !formIsValid" @click="save">Save</ActionButton>
      <ActionButton @click="close">Cancel</ActionButton>
    </template>
  </ModalDialog>
</template>

<style scoped>
.notificationsForm {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
</style>
