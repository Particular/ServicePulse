<script setup>
import { inject, ref, reactive, onMounted } from "vue";
import PlatformLicenseExpired from "../PlatformLicenseExpired.vue";
import PlatformTrialExpired from "../PlatformTrialExpired.vue";
import PlatformProtectionExpired from "../PlatformProtectionExpired.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import RetryRedirectEdit from "./RetryRedirectEdit.vue";
import RetryRedirectDelete from "./RetryRedirectDelete.vue";
import NoData from "../NoData.vue";
import BusyIndicator from "../BusyIndicator.vue";
import { useShowToast } from "../../composables/toast.js";
import TimeSince from "../TimeSince.vue";

import {
  key_ServiceControlUrl,
  key_IsSCConnected,
  key_ScConnectedAtLeastOnce,
  key_IsSCConnecting,
  key_IsPlatformExpired,
  key_IsPlatformTrialExpired,
  key_IsInvalidDueToUpgradeProtectionExpired,
} from "./../../composables/keys.js";
import {
  useRedirects,
  useUpdateRedirects,
  useCreateRedirects,
  useDeleteRedirects,
  retryPendingMessagesForQueue,
} from "../../composables/serviceRedirects.js";

const isPlatformExpired = inject(key_IsPlatformExpired);
const isPlatformTrialExpired = inject(key_IsPlatformTrialExpired);
const isInvalidDueToUpgradeProtectionExpired = inject(
  key_IsInvalidDueToUpgradeProtectionExpired
);

const isSCConnected = inject(key_IsSCConnected);
const scConnectedAtLeastOnce = inject(key_ScConnectedAtLeastOnce);
const isSCConnecting = inject(key_IsSCConnecting);

const configuredServiceControlUrl = inject(key_ServiceControlUrl);

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

function getRedirect() {
  loadingData.value = true;
  useRedirects(configuredServiceControlUrl.value).then((result) => {
    redirects.total = result.total;
    redirects.data = result.data;
    selectedRedirect.value.queues = result.queues;
    loadingData.value = false;
  });
}

function createRedirect() {
  redirectSaveSuccessful.value = null;
  (selectedRedirect.value.message_redirect_id = null),
    (selectedRedirect.value.from_physical_address = "");
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

function saveEditedRedirect(redirect) {
  redirectSaveSuccessful.value = null;
  showEdit.value = false;
  useUpdateRedirects(
    configuredServiceControlUrl.value,
    redirect.redirectId,
    redirect.sourceQueue,
    redirect.targetQueue
  )
    .then((result) => {
      if (result.message === "success") {
        redirectSaveSuccessful.value = true;
        useShowToast("info", "Info", "Redirect updated");
        getRedirect();
      } else {
        redirectSaveSuccessful.value = false;
        if (result.status === "409" || result.status === 409) {
          useShowToast(
            "error",
            "Error",
            "Failed to update a redirect, can not create redirect to a queue" +
              redirect.targetQueue +
              " as it already has a redirect. Provide a different queue or end the redirect."
          );
        } else {
          useShowToast("error", "Error", result.message);
        }
      }
      return result;
    })
    .then((result) => {
      if (result.message === "success" && redirect.immediatelyRetry) {
        return retryPendingMessagesForQueue(
          configuredServiceControlUrl.value,
          redirect.sourceQueue
        );
      } else {
        return result;
      }
    });
}

function saveCreatedRedirect(redirect) {
  redirectSaveSuccessful.value = null;
  showEdit.value = false;
  useCreateRedirects(
    configuredServiceControlUrl.value,
    redirect.sourceQueue,
    redirect.targetQueue
  ).then((result) => {
    if (result.message === "success") {
      redirectSaveSuccessful.value = true;
      useShowToast("info", "Info", "Redirect created");
      getRedirect();
    } else {
      redirectSaveSuccessful.value = false;
      if (
        (result.status === "409" || result.status === 409) &&
        result.statusText === "Duplicate"
      ) {
        useShowToast(
          "error",
          "Error",
          "Failed to create a redirect, can not create more than one redirect for queue: " +
            redirect.sourceQueue
        );
      } else if (
        (result.status === "409" || result.status === 409) &&
        result.statusText === "Dependents"
      ) {
        useShowToast(
          "error",
          "Error",
          "Failed to create a redirect, can not create a redirect to a queue that already has a redirect or is a target of a redirect."
        );
      } else {
        useShowToast("error", "Error", result.message);
      }
    }
  });
}

function deleteRedirect(redirect) {
  redirectSaveSuccessful.value = null;
  (selectedRedirect.value.message_redirect_id = redirect.message_redirect_id),
    (showDelete.value = true);
}

function saveDeleteRedirect(redirectId) {
  showDelete.value = false;
  useDeleteRedirects(configuredServiceControlUrl.value, redirectId).then(
    (result) => {
      if (result.message === "success") {
        redirectSaveSuccessful.value = true;
        useShowToast("info", "Info", "Redirect deleted");
        getRedirect();
      } else {
        redirectSaveSuccessful.value = false;
        useShowToast("error", "Error", result.message);
      }
    }
  );
}

onMounted(() => {
  getRedirect();
});
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
    <section name="redirects">
      <div class="sp-loader" v-if="isSCConnecting"></div>
      <ServiceControlNotAvailable
        :isSCConnected="isSCConnected"
        :isSCConnecting="isSCConnecting"
        :scConnectedAtLeastOnce="scConnectedAtLeastOnce"
      />

      <template v-if="isSCConnected || scConnectedAtLeastOnce">
        <section>
          <busy-indicator v-if="loadingData"></busy-indicator>

          <div class="row">
            <div class="col-sm-12">
              <div class="btn-toolbar">
                <button
                  type="button"
                  class="btn btn-default"
                  @click="createRedirect"
                >
                  <i class="fa pa-redirect-source pa-redirect-small"></i> Create
                  Redirect
                </button>
                <span></span>
              </div>
            </div>
          </div>

          <NoData
            v-if="redirects.total === 0 && !loadingData"
            title="Redirects"
            message="There are currently no redirects"
          ></NoData>

          <div class="row">
            <template v-if="redirects.total > 0">
              <div class="col-sm-12">
                <template
                  v-for="redirect in redirects.data"
                  :key="redirect.message_redirect_id"
                >
                  <div class="row box repeat-modify">
                    <div class="row" id="{{redirect.from_physical_address}}">
                      <div class="col-sm-12">
                        <p
                          class="lead hard-wrap truncate"
                          uib-tooltip="{{redirect.from_physical_address}}"
                        >
                          <i
                            class="fa pa-redirect-source pa-redirect-small"
                            uib-tooltip="Source queue name"
                          ></i>
                          {{ redirect.from_physical_address }}
                        </p>
                        <p
                          class="lead hard-wrap truncate"
                          uib-tooltip="{{redirect.to_physical_address}}"
                        >
                          <i
                            class="fa pa-redirect-destination pa-redirect-small"
                            uib-tooltip="Destination queue name"
                          ></i>
                          {{ redirect.to_physical_address }}
                        </p>
                        <p class="metadata">
                          <i class="fa fa-clock-o"></i>
                          Last modified:
                          <time-since
                            :dateUtc="redirect.last_modified"
                          ></time-since>
                        </p>
                      </div>
                    </div>
                    <div class="row">
                      <div isolate-click class="col-sm-12">
                        <p class="small">
                          <button
                            type="button"
                            class="btn btn-link btn-sm"
                            @click="deleteRedirect(redirect)"
                          >
                            End Redirect
                          </button>
                          <button
                            type="button"
                            class="btn btn-link btn-sm"
                            @click="editRedirect(redirect)"
                          >
                            Modify Redirect
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </div>
          <Teleport to="#modalDisplay">
            <RetryRedirectDelete
              v-if="showDelete === true"
              :message_redirect_id="selectedRedirect.message_redirect_id"
              @cancel="showDelete = false"
              @delete="saveDeleteRedirect"
            ></RetryRedirectDelete>
          </Teleport>
          <Teleport to="#modalDisplay">
            <RetryRedirectEdit
              v-if="showEdit === true"
              v-bind="selectedRedirect"
              @cancel="showEdit = false"
              @create="saveCreatedRedirect"
              @edit="saveEditedRedirect"
            ></RetryRedirectEdit>
          </Teleport>
        </section>
      </template>
    </section>
  </template>
</template>

<style scoped></style>
