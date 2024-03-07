<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { licenseStatus } from "../../composables/serviceLicense";
import { connectionState } from "../../composables/serviceServiceControl";
import { useFetchFromServiceControl, usePatchToServiceControl } from "../../composables/serviceServiceControlUrls";
import { useShowToast } from "../../composables/toast";
import { useRetryMessages } from "../../composables/serviceFailedMessage";
import { useDownloadFile } from "../../composables/fileDownloadCreator";
import { onBeforeRouteLeave, useRoute } from "vue-router";
import { useArchiveExceptionGroup, useRetryExceptionGroup } from "../../composables/serviceMessageGroup";
import LicenseExpired from "../../components/LicenseExpired.vue";
import OrderBy from "./OrderBy.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import MessageList from "./MessageList.vue";
import ConfirmDialog from "../ConfirmDialog.vue";
import PaginationStrip from "../../components/PaginationStrip.vue";
import { FailedMessageStatus } from "@/resources/FailedMessage";

let pollingFaster = false;
let refreshInterval = undefined;
let sortMethod = undefined;
const perPage = 50;
const route = useRoute();
const groupId = ref(route.params.groupId);
const groupName = ref("");
const pageNumber = ref(1);
const totalCount = ref(0);
const showDelete = ref(false);
const showConfirmRetryAll = ref(false);
const showConfirmDeleteAll = ref(false);
const messageList = ref();
const messages = ref([]);
const sortOptions = [
  {
    description: "Time of failure",
    selector: function (group) {
      return group.title;
    },
    icon: "bi-sort-",
  },
  {
    description: "Message Type",
    selector: function (group) {
      return group.count;
    },
    icon: "bi-sort-alpha-",
  },
];

watch(pageNumber, () => loadMessages());

function sortGroups(sort) {
  sortMethod = sort;
  loadMessages();
}

function loadMessages() {
  loadPagedMessages(groupId.value, pageNumber.value, sortMethod?.description.replaceAll(" ", "_").toLowerCase(), sortMethod.dir);
}

async function loadGroupDetails(groupId) {
  const response = await useFetchFromServiceControl(`recoverability/groups/id/${groupId}`);
  const data = await response.json();
  groupName.value = data.title;
}

function loadPagedMessages(groupId, page, sortBy, direction) {
  if (typeof sortBy === "undefined") sortBy = "time_of_failure";
  if (typeof direction === "undefined") direction = "desc";
  if (typeof page === "undefined") page = 1;

  let loadGroupDetailsPromise;
  if (groupId && !groupName.value) {
    loadGroupDetailsPromise = loadGroupDetails(groupId);
  }

  async function loadMessages() {
    try {
      const response = await useFetchFromServiceControl(`${groupId ? `recoverability/groups/${groupId}/` : ""}errors?status=${FailedMessageStatus.Unresolved}&page=${page}&per_page=${perPage}&sort=${sortBy}&direction=${direction}`);
      totalCount.value = parseInt(response.headers.get("Total-Count"));
      const data = await response.json();
      if (messages.value.length && data.length) {
        // merge the previously selected messages into the new list so we can replace them
        messages.value.forEach((previousMessage) => {
          const receivedMessage = data.find((m) => m.id === previousMessage.id);
          if (receivedMessage) {
            if (previousMessage.last_modified === receivedMessage.last_modified) {
              receivedMessage.retryInProgress = previousMessage.retryInProgress;
              receivedMessage.deleteInProgress = previousMessage.deleteInProgress;
            }

            receivedMessage.selected = previousMessage.selected;
          }
        });
      }
      messages.value = data;
    } catch (err) {
      console.log(err);
      const result = {
        message: "error",
      };
      return result;
    }
  }

  const loadMessagesPromise = loadMessages();

  if (loadGroupDetailsPromise) {
    return Promise.all([loadGroupDetailsPromise, loadMessagesPromise]);
  }

  return loadMessagesPromise;
}

async function retryRequested(id) {
  changeRefreshInterval(1000);
  useShowToast("info", "Info", "Message retry requested...");
  await useRetryMessages([id]);
  const message = messages.value.find((m) => m.id === id);
  if (message) {
    message.retryInProgress = true;
    message.selected = false;
  }
}

async function retrySelected() {
  changeRefreshInterval(1000);
  const selectedMessages = messageList.value.getSelectedMessages();
  useShowToast("info", "Info", "Retrying " + selectedMessages.length + " messages...");
  await useRetryMessages(selectedMessages.map((m) => m.id));
  messageList.value.deselectAll();
  selectedMessages.forEach((m) => (m.retryInProgress = true));
}

function exportSelected() {
  function toCSV(array) {
    const keys = Object.keys(array[0]);
    let result = keys.join("\t") + "\n";
    array.forEach((obj) => {
      result += keys.map((k) => obj[k]).join(",") + "\n";
    });

    return result;
  }

  function parseObject(obj, propertiesToSkip, path = "") {
    const type = typeof obj;
    let d = {};

    if (type === "array" || type === "object") {
      for (const i in obj) {
        const newD = parseObject(obj[i], propertiesToSkip, path + i + ".");
        d = Object.assign(d, newD);
      }
      return d;
    } else if (type === "number" || type === "string" || type === "boolean" || type === "null") {
      const endPath = path.substr(0, path.length - 1);
      if (propertiesToSkip && propertiesToSkip.includes(endPath)) {
        return d;
      }
      d[endPath] = obj;
      return d;
    }

    return d;
  }

  const selectedMessages = messageList.value.getSelectedMessages();
  const propertiesToSkip = ["hover", "selected", "hover2", "$$hashKey", "panel", "edit_of", "edited"];

  const preparedMessagesForExport = [];
  for (let i = 0; i < selectedMessages.length; i++) {
    preparedMessagesForExport.push(parseObject(selectedMessages[i], propertiesToSkip));
  }

  const csvStr = toCSV(preparedMessagesForExport);
  useDownloadFile(csvStr, "text/csv", "failedMessages.csv");
}

function numberSelected() {
  return messageList?.value?.getSelectedMessages()?.length ?? 0;
}

function selectAll() {
  messageList.value.selectAll();
}

function deselectAll() {
  messageList.value.deselectAll();
}

function isAnythingSelected() {
  return messageList?.value?.isAnythingSelected();
}

async function deleteSelectedMessages() {
  changeRefreshInterval(1000);
  const selectedMessages = messageList.value.getSelectedMessages();

  useShowToast("info", "Info", "Deleting " + selectedMessages.length + " messages...");
  await usePatchToServiceControl(
    "errors/archive",
    selectedMessages.map((m) => m.id)
  );
  messageList.value.deselectAll();
  selectedMessages.forEach((m) => (m.deleteInProgress = true));
}

async function retryGroup() {
  useShowToast("info", "Info", "Retrying all messages...");
  await useRetryExceptionGroup(groupId.value);
  messages.value.forEach((m) => (m.retryInProgress = true));
}

async function deleteGroup() {
  useShowToast("info", "Info", "Deleting all messages...");
  await useArchiveExceptionGroup(groupId.value);
  messages.value.forEach((m) => (m.deleteInProgress = true));
}

function isRetryOrDeleteOperationInProgress() {
  return messages.value.some((message) => {
    return message.retryInProgress || message.deleteInProgress;
  });
}

function changeRefreshInterval(milliseconds) {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(() => {
    // If we're currently polling at 5 seconds and there is a retry or delete in progress, then change the polling interval to poll every 1 second
    if (!pollingFaster && isRetryOrDeleteOperationInProgress()) {
      changeRefreshInterval(1000);
      pollingFaster = true;
    } else if (pollingFaster && !isRetryOrDeleteOperationInProgress()) {
      // if we're currently polling every 1 second but all retries or deletes are done, change polling frequency back to every 5 seconds
      changeRefreshInterval(5000);
      pollingFaster = false;
    }

    loadMessages();
  }, milliseconds);
}

onBeforeRouteLeave(() => {
  groupId.value = undefined;
  groupName.value = undefined;
});

onUnmounted(() => {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }
});

onMounted(() => {
  loadMessages();

  changeRefreshInterval(5000);
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <ServiceControlNotAvailable />
    <template v-if="!connectionState.unableToConnect">
      <section name="message_groups">
        <div class="row" v-if="groupName && messages.length > 0">
          <div class="col-sm-12">
            <h1 v-if="groupName" class="active break group-title">
              {{ groupName }}
            </h1>
            <h3 class="active group-title group-message-count">{{ totalCount }} messages in group</h3>
          </div>
        </div>
        <div class="row">
          <div class="col-9">
            <div class="btn-toolbar">
              <button type="button" class="btn btn-default select-all" @click="selectAll" v-if="!isAnythingSelected()">Select all</button>
              <button type="button" class="btn btn-default select-all" @click="deselectAll" v-if="isAnythingSelected()">Clear selection</button>
              <button type="button" class="btn btn-default" @click="retrySelected()" :disabled="!isAnythingSelected()"><i class="fa fa-repeat"></i> Retry {{ numberSelected() }} selected</button>
              <button type="button" class="btn btn-default" @click="showDelete = true" :disabled="!isAnythingSelected()"><i class="fa fa-trash"></i> Delete {{ numberSelected() }} selected</button>
              <button type="button" class="btn btn-default" @click="exportSelected()" :disabled="!isAnythingSelected()"><i class="fa fa-download"></i> Export {{ numberSelected() }} selected</button>
              <button type="button" class="btn btn-default" v-if="groupId" @click="showConfirmRetryAll = true"><i class="fa fa-repeat"></i> Retry all</button>
              <button type="button" class="btn btn-default" v-if="groupId" @click="showConfirmDeleteAll = true"><i class="fa fa-trash"></i> Delete all</button>
            </div>
          </div>
          <div class="col-3">
            <OrderBy @sort-updated="sortGroups" :sortOptions="sortOptions" sortSavePrefix="all_failed_"></OrderBy>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <MessageList :messages="messages" :showRequestRetry="true" @retry-requested="retryRequested" ref="messageList"></MessageList>
          </div>
        </div>
        <div class="row">
          <PaginationStrip v-model="pageNumber" :total-count="totalCount" :items-per-page="perPage" />
        </div>
        <Teleport to="#modalDisplay">
          <ConfirmDialog
            v-if="showDelete"
            @cancel="showDelete = false"
            @confirm="
              showDelete = false;
              deleteSelectedMessages();
            "
            :heading="'Are you sure you want to delete the selected messages?'"
            :body="'If you delete, these messages won\'t be available for retrying unless they\'re later restored.'"
          ></ConfirmDialog>

          <ConfirmDialog
            v-if="showConfirmRetryAll"
            @cancel="showConfirmRetryAll = false"
            @confirm="
              showConfirmRetryAll = false;
              retryGroup();
            "
            :heading="'Are you sure you want to retry the whole group?'"
            :body="'Retrying a whole group can take some time and put extra load on your system. Are you sure you want to retry all these messages?'"
          ></ConfirmDialog>

          <ConfirmDialog
            v-if="showConfirmDeleteAll"
            @cancel="showConfirmDeleteAll = false"
            @confirm="
              showConfirmDeleteAll = false;
              deleteGroup();
            "
            :heading="'Are you sure you want to delete this group?'"
            :body="'If you delete, the messages in the group won\'t be available for retrying unless they\'re later restored.'"
          ></ConfirmDialog>
        </Teleport>
      </section>
    </template>
  </template>
</template>

<style></style>
