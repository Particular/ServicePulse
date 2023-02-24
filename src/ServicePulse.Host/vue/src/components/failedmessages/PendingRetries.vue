<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { licenseStatus } from "../../composables/serviceLicense.js";
import { connectionState } from "../../composables/serviceServiceControl.js";
import { useEndpoints } from "../../composables/serviceEndpoints";
import { useFetchFromServiceControl, usePostToServiceControl, usePatchToServiceControl } from "../../composables/serviceServiceControlUrls.js";
import { useShowToast } from "../../composables/toast.js";
import LicenseExpired from "../../components/LicenseExpired.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import MessageList from "./MessageList.vue";
import ConfirmDialog from "../ConfirmDialog.vue";

let refreshInterval = undefined;
const endpoints = ref([]);
const messageList = ref();
const messages = ref([]);
const selectedQueue = ref("empty");
const showConfirmRetry = ref(false);
const showConfirmResolve = ref(false);
const showConfirmResolveAll = ref(false);

function loadEndpoints() {
  const loader = new useEndpoints();
  loader.getQueueNames().then((queues) => {
    endpoints.value = queues.map((endpoint) => endpoint.physical_address);
  });
}

function clearSelectedQueue() {
  selectedQueue.value = "empty";
}

function loadPendingRetryMessages(page, sortBy, direction, searchPhrase) {
  if (typeof sortBy === "undefined") sortBy = "time_of_failure";
  if (typeof direction === "undefined") direction = "desc";
  if (typeof page === "undefined") page = 1;
  if (typeof searchPhrase === "undefined") searchPhrase = "";

  return useFetchFromServiceControl(`errors?status=retryissued&page=${page}&sort=${sortBy}&direction=${direction}&queueaddress=${searchPhrase}`)
    .then((response) => {
      return response.json();
    })
    .then(response => {
      messages.value.forEach((previousMessage) => {
        const receivedMessage = response.find((m) => m.id === previousMessage.id);
        if (receivedMessage) {
          if (previousMessage.last_modified == receivedMessage.last_modified) {
            receivedMessage.submittedForRetrial = previousMessage.submittedForRetrial;
            receivedMessage.resolved = previousMessage.resolved;
          }

          receivedMessage.selected = previousMessage.selected;
        }
      });

      messages.value = response;
    })
    .catch((err) => {
      console.log(err);
      var result = {
        message: "error",
      };
      return result;
    });
}

function isAnythingSelected() {
  return messageList?.value?.isAnythingSelected();
}

function numberSelected() {
  return messageList?.value?.getSelectedMessages()?.length ?? 0;
}

function retrySelectedMessages() {
  const selectedMessages = messageList.value.getSelectedMessages();
  
  useShowToast("info", "Info", "Selected messages were submitted for retry...");
  return usePostToServiceControl("pendingretries/retry", selectedMessages.map((m) => m.id))
  .then(() => {
    messageList.value.deselectAll();
    selectedMessages.forEach((m) => (m.submittedForRetrial = true));
  });
}

function resolveSelectedMessages() {
  const selectedMessages = messageList.value.getSelectedMessages();
  
  useShowToast("info", "Info", "Selected messages were marked as resolved.");
  return usePatchToServiceControl("pendingretries/resolve", { uniquemessageids: selectedMessages.map((m) => m.id) })
  .then(() => {
    messageList.value.deselectAll();
    selectedMessages.forEach((m) => (m.resolved = true));
  });
}

function resolveAllMessages() {
  useShowToast("info", "Info", "All filtered messages were marked as resolved.");
  return usePatchToServiceControl("pendingretries/resolve", { from: new Date(0).toISOString(), to: new Date().toISOString() })
  .then(() => {
    messageList.value.deselectAll();
    messageList.value.forEach((m) => (m.resolved = true));
  });
}

onUnmounted(() => {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }
});

onMounted(() => {
  loadEndpoints();
  loadPendingRetryMessages();

  refreshInterval = setInterval(() => {
    loadPendingRetryMessages();
  }, 5000);
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <ServiceControlNotAvailable />
    <template v-if="!connectionState.unableToConnect">
      <section name="pending_retries">
        <div class="row">
          <div class="col-12">
            <div class="alert alert-info"><i class="fa fa-info-circle"></i> To check if a retried message was also processed successfully, enable <a href="https://docs.particular.net/nservicebus/operations/auditing" target="_blank">message auditing</a> <i class="fa fa-external-link fake-link"></i></div>
          </div>
        </div>
        <div class="row">
          <div class="col-6">
            <div class="filter-input">
              <div class="input-group mb-3">
                <label class="input-group-text"><i class="fa fa-filter" aria-hidden="true"></i> <span class="hidden-xs">Filter</span></label>
                <select class="form-select" id="inputGroupSelect01" onchange="this.dataset.chosen = true;" v-model="selectedQueue">
                  <option selected disabled hidden class="placeholder" value="empty">Select a queue...</option>
                  <option v-for="(endpoint, index) in endpoints" :key="index" :value="endpoint">{{ endpoint }}</option>
                </select>
                <span class="input-group-btn">
                  <button type="button" @click="clearSelectedQueue()" class="btn btn-default"><i class="fa fa-times" aria-hidden="true"></i></button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-6 col-xs-12 toolbar-menus">
            <div class="action-btns">
              <button type="button" class="btn btn-default" :disabled="!isAnythingSelected()" @click="showConfirmRetry = true"><i class="fa fa-repeat"></i> <span>Retry</span> ({{ numberSelected() }})</button>
              <button type="button" class="btn btn-default" :disabled="!isAnythingSelected()" @click="showConfirmResolve = true"><i class="fa fa-check-square-o"></i> <span>Mark as resolved</span> ({{ numberSelected() }})</button>
              <button type="button" class="btn btn-default" ng-disabled="vm.filteredTotal === '0'" confirm-title="vm.retryAllConfirmationTitle()" confirm-message="vm.retryAllConfirmationMessage()" confirm-click="vm.retryAll()" confirm-ok-only="vm.isQueueFilterEmpty()"><i class="fa fa-repeat"></i> <span>Retry all</span></button>
              <button type="button" class="btn btn-default" @click="showConfirmResolveAll = true"><i class="fa fa-check-square-o"></i> <span>Mark all as resolved</span></button>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <MessageList :messages="messages" ref="messageList"></MessageList>
          </div>
        </div>
        <Teleport to="#modalDisplay">
          <ConfirmDialog
            v-if="showConfirmRetry === true"
            @cancel="showConfirmRetry = false"
            @confirm="showConfirmRetry = false; retrySelectedMessages();"
            :heading="'Are you sure you want to retry the selected messages?'"
            :body="'Ensure that the selected messages were not processed previously as this will create a duplicate message.'"
            :second-paragraph="'NOTE: If the selection includes messages to be processed via unaudited endpoints, those messages will need to be marked as resolved once the retry is manually verified'"
          ></ConfirmDialog>

          <ConfirmDialog
            v-if="showConfirmResolve === true"
            @cancel="showConfirmResolve = false"
            @confirm="showConfirmResolve = false; resolveSelectedMessages();"
            :heading="'Are you sure you want to mark as resolved the selected messages?'"
            :body="'If you mark these messages as resolved they will not be available for Retry. Messages should only be marked as resolved only if they belong to unaudited endpoints.'"
          ></ConfirmDialog>

          <ConfirmDialog
            v-if="showConfirmResolveAll === true"
            @cancel="showConfirmResolveAll = false"
            @confirm="showConfirmResolveAll = false; resolveAllMessages();"
            :heading="'Are you sure you want to resolve all messages?'"
            :body="'Are you sure you want to mark as resolved all messages? If you do they will not be available for Retry.'"
          ></ConfirmDialog>
        </Teleport>
      </section>
    </template>
  </template>
</template>

<style>
.input-group-text {
  margin-bottom: 0;
}

.input-group-text > span {
  font-size: 14px;
  padding-left: 5px;
  color: #555;
}

.input-group > select {
  font-size: 14px;
  color: #777777;
}

.input-group > select[data-chosen="true"] {
  color: #212529;
}

.input-group > select:hover {
  box-shadow: 0 0 10px 100px var(--bs-btn-hover-bg) inset;
  color: #212529;
}

.input-group-btn:last-child > .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.action-btns > .btn {
  margin-right: 5px;
}
</style>
