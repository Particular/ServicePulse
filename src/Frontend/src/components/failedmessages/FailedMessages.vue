<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import { useShowToast } from "../../composables/toast";
import { downloadFileFromString } from "../../composables/fileDownloadCreator";
import { onBeforeRouteLeave } from "vue-router";
import createMessageGroupClient from "./messageGroupClient";
import LicenseNotExpired from "../../components/LicenseNotExpired.vue";
import OrderBy from "@/components/OrderBy.vue";
import ServiceControlAvailable from "../ServiceControlAvailable.vue";
import MessageList, { IMessageList } from "./MessageList.vue";
import ConfirmDialog from "../ConfirmDialog.vue";
import PaginationStrip from "../../components/PaginationStrip.vue";
import { FailedMessageStatus } from "@/resources/FailedMessage";
import SortOptions from "@/resources/SortOptions";
import { TYPE } from "vue-toastification";
import GroupOperation from "@/resources/GroupOperation";
import { faArrowDownAZ, faArrowDownZA, faArrowDownShortWide, faArrowDownWideShort, faArrowRotateRight, faTrash, faDownload } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "@/components/ActionButton.vue";
import { useMessageStore } from "@/stores/MessageStore";
import { useMessagesStore } from "@/stores/MessagesStore";
import { useStoreAutoRefresh } from "@/composables/useAutoRefresh";
import { storeToRefs } from "pinia";
import LoadingSpinner from "../LoadingSpinner.vue";

const POLLING_INTERVAL_NORMAL = 5000;
const POLLING_INTERVAL_FAST = 1000;

const messageStore = useMessageStore();
const messageGroupClient = createMessageGroupClient();
const loading = ref(false);
const { autoRefresh, isRefreshing, updateInterval } = useStoreAutoRefresh("messagesStore", useMessagesStore, POLLING_INTERVAL_NORMAL);
const { store } = autoRefresh();
const { messages, groupId, groupName, totalCount, pageNumber } = storeToRefs(store);

const showDelete = ref(false);
const showConfirmRetryAll = ref(false);
const showConfirmDeleteAll = ref(false);
const messageList = useTemplateRef<IMessageList>("messageList");
const sortOptions: SortOptions<GroupOperation>[] = [
  {
    description: "Time of failure",
    iconAsc: faArrowDownShortWide,
    iconDesc: faArrowDownWideShort,
  },
  {
    description: "Message Type",
    iconAsc: faArrowDownAZ,
    iconDesc: faArrowDownZA,
  },
];

async function sortGroups(sort: SortOptions<GroupOperation>) {
  loading.value = true;
  await store.setSort(sort.description.replaceAll(" ", "_").toLowerCase(), sort.dir);
  loading.value = false;
}

async function retryRequested(id: string) {
  // We're starting a retry, poll more frequently
  updateInterval(POLLING_INTERVAL_FAST);
  useShowToast(TYPE.INFO, "Info", "Message retry requested...");
  await messageStore.retryMessages([id]);
  const message = messages.value.find((m) => m.id === id);
  if (message) {
    message.retryInProgress = true;
    message.selected = false;
  }
}

async function retrySelected() {
  // We're starting a retry, poll more frequently
  updateInterval(POLLING_INTERVAL_FAST);
  const selectedMessages = messageList.value?.getSelectedMessages() ?? [];
  useShowToast(TYPE.INFO, "Info", "Retrying " + selectedMessages.length + " messages...");
  await messageStore.retryMessages(selectedMessages.map((m) => m.id));
  messageList.value?.deselectAll();
  selectedMessages.forEach((m) => (m.retryInProgress = true));
}

//Not attempting to use explicit types correctly since this will need to change eventually anyway
function exportSelected() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function toCSV(array: any[]) {
    const delimiter = ",";
    const keys = Object.keys(array[0]);
    let result = keys.join(delimiter) + "\n";
    array.forEach((obj) => {
      result +=
        keys
          .map((k) => {
            let v = String(obj[k]);
            v = v.replaceAll('"', '""'); // Escape all double quotes
            if (v.search(/([",\n])/g) >= 0) v = `"${v}"`; // Quote all values to deal with CR characters
            return v;
          })
          .join(delimiter) + "\n";
    });

    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function parseObject(obj: any | null, propertiesToSkip: string[], path = "") {
    const type = typeof obj;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let d = {} as any;

    if (obj != null && type === "object") {
      for (const i in obj) {
        const newD = parseObject(obj[i], propertiesToSkip, path + i + ".");
        d = Object.assign(d, newD);
      }
      return d;
    } else if (type === "number" || type === "string" || type === "boolean" || obj == null) {
      const endPath = path.substr(0, path.length - 1);
      if (propertiesToSkip && propertiesToSkip.includes(endPath)) {
        return d;
      }
      d[endPath] = obj;
      return d;
    }

    return d;
  }

  const selectedMessages = messageList.value?.getSelectedMessages() ?? [];
  const propertiesToSkip = ["hover", "selected", "hover2", "$$hashKey", "panel", "edit_of", "edited"];

  const preparedMessagesForExport = [];
  for (let i = 0; i < selectedMessages.length; i++) {
    preparedMessagesForExport.push(parseObject(selectedMessages[i], propertiesToSkip));
  }

  const csvStr = toCSV(preparedMessagesForExport);
  downloadFileFromString(csvStr, "text/csv", "failedMessages.csv");
}

function numberSelected() {
  return messageList.value?.getSelectedMessages()?.length ?? 0;
}

function selectAll() {
  messageList.value?.selectAll();
}

function deselectAll() {
  messageList.value?.deselectAll();
}

function isAnythingSelected() {
  return messageList?.value?.isAnythingSelected();
}

async function deleteSelectedMessages() {
  // We're starting a delete, poll more frequently
  updateInterval(POLLING_INTERVAL_FAST);
  const selectedMessages = messageList.value?.getSelectedMessages() ?? [];

  useShowToast(TYPE.INFO, "Info", "Deleting " + selectedMessages.length + " messages...");
  await store.deleteById(selectedMessages.map((m) => m.id));
  messageList.value?.deselectAll();
  selectedMessages.forEach((m) => (m.deleteInProgress = true));
}

async function retryGroup() {
  useShowToast(TYPE.INFO, "Info", "Retrying all messages...");
  await messageGroupClient.retryExceptionGroup(groupId.value);
  messages.value.forEach((m) => (m.retryInProgress = true));
}

async function deleteGroup() {
  useShowToast(TYPE.INFO, "Info", "Deleting all messages...");
  await messageGroupClient.archiveExceptionGroup(groupId.value);
  messages.value.forEach((m) => (m.deleteInProgress = true));
}

onBeforeRouteLeave(() => {
  groupId.value = "";
  groupName.value = "";
});

const isRetryOrDeleteOperationInProgress = computed(() => messages.value.some((message) => message.retryInProgress || message.deleteInProgress));
watch(isRetryOrDeleteOperationInProgress, (retryOrDeleteOperationInProgress) => {
  // If there is a retry or delete in progress, then change the polling interval to poll every 1 second
  if (retryOrDeleteOperationInProgress) {
    updateInterval(POLLING_INTERVAL_FAST);
  } else {
    // if all retries or deletes are done, change polling frequency back to every 5 seconds
    updateInterval(POLLING_INTERVAL_NORMAL);
  }
});

onMounted(async () => {
  loading.value = true;
  await store.setMessageStatus(FailedMessageStatus.Unresolved);
  loading.value = false;
});
</script>

<template>
  <ServiceControlAvailable>
    <LicenseNotExpired>
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
              <ActionButton v-if="!isAnythingSelected()" @click="selectAll">Select all</ActionButton>
              <ActionButton v-if="isAnythingSelected()" @click="deselectAll">Clear selection</ActionButton>
              <ActionButton :icon="faArrowRotateRight" @click="retrySelected()" :disabled="!isAnythingSelected()">Retry {{ numberSelected() }} selected</ActionButton>
              <ActionButton :icon="faTrash" @click="showDelete = true" :disabled="!isAnythingSelected()">Delete {{ numberSelected() }} selected</ActionButton>
              <ActionButton :icon="faDownload" @click="exportSelected()" :disabled="!isAnythingSelected()">Export {{ numberSelected() }} selected</ActionButton>
              <ActionButton v-if="groupId" :icon="faArrowRotateRight" @click="showConfirmRetryAll = true">Retry all</ActionButton>
              <ActionButton v-if="groupId" :icon="faTrash" @click="showConfirmDeleteAll = true">Delete all</ActionButton>
            </div>
          </div>
          <div class="col-3">
            <OrderBy @sort-updated="sortGroups" :sortOptions="sortOptions" sortSavePrefix="all_failed_"></OrderBy>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <LoadingSpinner v-if="messages.length === 0 && (loading || isRefreshing)" />
            <MessageList v-else :messages="messages" :show-request-retry="true" @retry-requested="retryRequested" ref="messageList"></MessageList>
          </div>
        </div>
        <div class="row">
          <PaginationStrip v-model="pageNumber" :total-count="totalCount" :items-per-page="store.perPage" />
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
    </LicenseNotExpired>
  </ServiceControlAvailable>
</template>

<style scoped></style>
