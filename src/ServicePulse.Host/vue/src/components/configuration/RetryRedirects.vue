<script setup>
import { onMounted, reactive, ref } from "vue";
import LicenseExpired from "../LicenseExpired.vue";
import { licenseStatus } from "../../composables/serviceLicense";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import { connectionState } from "../../composables/serviceServiceControl";
import RetryRedirectEdit from "./RetryRedirectEdit.vue";
import NoData from "../NoData.vue";
import BusyIndicator from "../BusyIndicator.vue";
import { useShowToast } from "../../composables/toast";
import TimeSince from "../TimeSince.vue";
import { useCreateRedirects, useDeleteRedirects, useRedirects, useRetryPendingMessagesForQueue, useUpdateRedirects } from "../../composables/serviceRedirects";
import ConfirmDialog from "../ConfirmDialog.vue";

const isExpired = licenseStatus.isExpired;

const emit = defineEmits(["redirectCountUpdated"]);

const loadingData = ref(true);
const redirects = reactive({
  total: 0,
  data: [],
});

const showDelete = ref(false);
const showEdit = ref(false);
const selectedRedirect = ref({
  message_redirect_id: "",
  from_physical_address: "",
  to_physical_address: "",
  date_last_modified: null,
  queues: [],
});

const redirectSaveSuccessful = ref(null);

async function getRedirect() {
  loadingData.value = true;
  const result = await useRedirects();
  if (redirects.total !== result.total) {
    emit("redirectCountUpdated", result.total);
  }
  redirects.total = result.total;
  redirects.data = result.data;
  selectedRedirect.value.queues = result.queues;
  loadingData.value = false;
}

function createRedirect() {
  redirectSaveSuccessful.value = null;
  (selectedRedirect.value.message_redirect_id = null), (selectedRedirect.value.from_physical_address = "");
  selectedRedirect.value.to_physical_address = "";
  showEdit.value = true;
}

function editRedirect(redirect) {
  redirectSaveSuccessful.value = null;
  selectedRedirect.value.message_redirect_id = redirect.message_redirect_id;
  selectedRedirect.value.from_physical_address = redirect.from_physical_address;
  selectedRedirect.value.to_physical_address = redirect.to_physical_address;
  showEdit.value = true;
}

async function saveEditedRedirect(redirect) {
  redirectSaveSuccessful.value = null;
  showEdit.value = false;
  const result = await useUpdateRedirects(redirect.redirectId, redirect.sourceQueue, redirect.targetQueue);
  if (result.message === "success") {
    redirectSaveSuccessful.value = true;
    useShowToast("info", "Info", "Redirect updated successfully");
    getRedirect();
  } else {
    redirectSaveSuccessful.value = false;
    if (result.status === 409) {
      useShowToast("error", "Error", "Failed to update a redirect, can not create redirect to a queue" + redirect.targetQueue + " as it already has a redirect. Provide a different queue or end the redirect.");
    } else {
      useShowToast("error", "Error", result.message);
    }
  }
  if (result.message === "success" && redirect.immediatelyRetry) {
    return useRetryPendingMessagesForQueue(redirect.sourceQueue);
  } else {
    return result;
  }
}

async function saveCreatedRedirect(redirect) {
  redirectSaveSuccessful.value = null;
  showEdit.value = false;
  const result = await useCreateRedirects(redirect.sourceQueue, redirect.targetQueue);
  if (result.message === "success") {
    redirectSaveSuccessful.value = true;
    useShowToast("info", "Info", "Redirect created successfully");
    getRedirect();
  } else {
    redirectSaveSuccessful.value = false;
    if (result.status === 409 && result.statusText === "Duplicate") {
      useShowToast("error", "Error", "Failed to create a redirect, can not create more than one redirect for queue: " + redirect.sourceQueue);
    } else if (result.status === 409 && result.statusText === "Dependents") {
      useShowToast("error", "Error", "Failed to create a redirect, can not create a redirect to a queue that already has a redirect or is a target of a redirect.");
    } else {
      useShowToast("error", "Error", result.message);
    }
  }
}

function deleteRedirect(redirect) {
  redirectSaveSuccessful.value = null;
  (selectedRedirect.value.message_redirect_id = redirect.message_redirect_id), (showDelete.value = true);
}

async function saveDeleteRedirect() {
  const result = await useDeleteRedirects(selectedRedirect.value.message_redirect_id);
  if (result.message === "success") {
    redirectSaveSuccessful.value = true;
    useShowToast("info", "Info", "Redirect deleted");
    getRedirect();
  } else {
    redirectSaveSuccessful.value = false;
    useShowToast("error", "Error", result.message);
  }
}

onMounted(() => {
  getRedirect();
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!isExpired">
    <section name="redirects">
      <ServiceControlNotAvailable />
      <template v-if="!connectionState.unableToConnect">
        <section>
          <busy-indicator v-if="loadingData"></busy-indicator>

          <div class="row">
            <div class="col-sm-12">
              <div class="btn-toolbar">
                <button type="button" class="btn btn-default" @click="createRedirect"><i class="fa pa-redirect-source pa-redirect-small"></i> Create Redirect</button>
                <span></span>
              </div>
            </div>
          </div>

          <NoData v-if="redirects.total === 0 && !loadingData" title="Redirects" message="There are currently no redirects"></NoData>

          <div class="row">
            <template v-if="redirects.total > 0">
              <div class="col-sm-12">
                <template v-for="redirect in redirects.data" :key="redirect.message_redirect_id">
                  <div class="row box repeat-modify">
                    <div class="row" id="{{redirect.from_physical_address}}">
                      <div class="col-sm-12">
                        <p class="lead hard-wrap truncate" :title="redirect.from_physical_address">
                          <i class="fa pa-redirect-source pa-redirect-small" title="Source queue name"></i>
                          {{ redirect.from_physical_address }}
                        </p>
                        <p class="lead hard-wrap truncate" :title="redirect.to_physical_address">
                          <i class="fa pa-redirect-destination pa-redirect-small" title="Destination queue name"></i>
                          {{ redirect.to_physical_address }}
                        </p>
                        <p class="metadata">
                          <i class="fa fa-clock-o"></i>
                          Last modified: <time-since :dateUtc="redirect.last_modified"></time-since>
                        </p>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-sm-12">
                        <p class="small">
                          <button type="button" class="btn btn-link btn-sm" @click="deleteRedirect(redirect)">End Redirect</button>
                          <button type="button" class="btn btn-link btn-sm" @click="editRedirect(redirect)">Modify Redirect</button>
                        </p>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </div>
          <Teleport to="#modalDisplay">
            <ConfirmDialog
              v-if="showDelete"
              @cancel="showDelete = false"
              @confirm="
                showDelete = false;
                saveDeleteRedirect();
              "
              :heading="'Are you sure you want to end the redirect?'"
              :body="'Once the redirect is ended, any affected messages will be sent to the original destination queue. Ensure this queue is ready to accept messages again.'"
            ></ConfirmDialog>
          </Teleport>
          <Teleport to="#modalDisplay">
            <RetryRedirectEdit v-if="showEdit === true" v-bind="selectedRedirect" @cancel="showEdit = false" @create="saveCreatedRedirect" @edit="saveEditedRedirect"></RetryRedirectEdit>
          </Teleport>
        </section>
      </template>
    </section>
  </template>
</template>

<style>
p.control-label {
  margin-bottom: 2px;
}
</style>
