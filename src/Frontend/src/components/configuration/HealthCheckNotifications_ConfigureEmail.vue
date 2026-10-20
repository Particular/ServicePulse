<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import type EmailNotifications from "@/resources/EmailNotifications";
import type UpdateEmailNotificationsSettingsRequest from "@/resources/UpdateEmailNotificationsSettingsRequest";
import ModalDialog from "../ModalDialog.vue";
import ActionButton from "../ActionButton.vue";
import ExternalLink from "@/components/ExternalLink.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import logger from "@/logger";

// The dialog reads the settings from ServiceControl when it opens, edits them here, and writes them back when saved.
// Nothing outlives the dialog: closing it drops everything below.
const emit = defineEmits<{
  saved: [succeeded: boolean];
  cancel: [];
}>();

const loading = ref(true);
const loadFailed = ref(false);
const saving = ref(false);

const smtp_server = ref("");
const smtp_port = ref<number | null>(null);
const authentication_account = ref("");
// Always starts empty: the stored password is never shown.
const authentication_password = ref("");
const enable_tls = ref<boolean | null>(null);
const from = ref("");
const to = ref("");

// Backward compatibility with ServiceControl before 6.21.2: those versions return the stored password, and replace it
// with whatever a save sends. It is kept here, never shown, to send back when the password is left empty.
// ServiceControl 6.21.2 and later (https://github.com/Particular/ServiceControl/pull/5980) never return it, so this
// stays empty, and they keep the stored password themselves when an empty one is sent.
let storedPassword = "";

onMounted(async () => {
  try {
    const [, settings] = await serviceControlClient.fetchTypedFromServiceControl<EmailNotifications>("notifications/email");
    smtp_server.value = settings.smtp_server ?? "";
    smtp_port.value = settings.smtp_port || null;
    authentication_account.value = settings.authentication_account ?? "";
    enable_tls.value = settings.enable_tls;
    from.value = settings.from ?? "";
    to.value = settings.to ?? "";
    // Only ServiceControl before 6.21.2 returns the password (backward compatibility, see storedPassword).
    storedPassword = settings.authentication_password ?? "";
  } catch (err) {
    logger.error(err);
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

async function save() {
  const settings: UpdateEmailNotificationsSettingsRequest = {
    smtp_server: smtp_server.value,
    smtp_port: smtp_port.value ?? 0,
    authorization_account: authentication_account.value,
    authorization_password: passwordToSave(),
    enable_tls: enable_tls.value ?? false,
    from: from.value,
    to: to.value,
  };
  saving.value = true;
  try {
    const response = await serviceControlClient.postToServiceControl("notifications/email", settings);
    if (!response.ok) logger.error(`Saving the email settings failed: ${response.statusText}`);
    emit("saved", response.ok);
  } catch (err) {
    logger.error(err);
    emit("saved", false);
  } finally {
    saving.value = false;
  }
}

function passwordToSave() {
  // A new password replaces the stored one.
  if (authentication_password.value) return authentication_password.value;
  // Without an account, the password is never used, so it is removed.
  if (!authentication_account.value) return "";
  // Otherwise keep the stored password. For backward compatibility with ServiceControl before 6.21.2, which would erase
  // it, it is sent back. ServiceControl 6.21.2 and later (https://github.com/Particular/ServiceControl/pull/5980) keep
  // it themselves when an empty password is sent, and storedPassword is empty there.
  return storedPassword;
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
      <ActionButton variant="primary" :disabled="loading || loadFailed || saving || !formIsValid" @click="save">Save</ActionButton>
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
