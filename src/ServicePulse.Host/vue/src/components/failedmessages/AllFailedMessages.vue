<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { licenseStatus } from "../../composables/serviceLicense.js";
import { connectionState } from "../../composables/serviceServiceControl.js";
import { useFetchFromServiceControl, usePatchToServiceControl } from "../../composables/serviceServiceControlUrls.js";
import { useShowToast } from "../../composables/toast.js";
import { useRetryMessages } from "../../composables/serviceFailedMessage";
import { useDownloadFile } from "../../composables/fileDownloadCreator";
import LicenseExpired from "../../components/LicenseExpired.vue";
import GroupAndOrderBy from "./GroupAndOrderBy.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import MessageList from "./MessageList.vue";
import FailedMessageDelete from "./FailedMessageDelete.vue";

let refreshInterval = undefined;
let sortMethod = undefined;
let isGroupDetails = false;
const pageNumber = ref(1);
const numberOfPages = ref(1);
const showDelete = ref(false);
const messageList = ref();
const totalCount = ref(0);
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

function sortGroups(sort) {
  sortMethod = sort;
  loadMessages();
}

function loadMessages() {
  loadPagedMessages(pageNumber.value, sortMethod.description.replace(" ", "_").toLowerCase(), sortMethod.dir);
}

function loadPagedMessages(page, sortBy, direction) {
  if (typeof sortBy === "undefined") sortBy = "time_of_failure";
  if (typeof direction === "undefined") direction = "desc";
  if (typeof page === "undefined") page = 1;

  return useFetchFromServiceControl(`errors?status=unresolved&page=${page}&sort=${sortBy}&direction=${direction}`)
    .then((response) => {
      totalCount.value = parseInt(response.headers.get("Total-Count"));
      numberOfPages.value = Math.ceil(totalCount.value / 50);

      return response.json();
    })
    .then((response) => {
      if (messages.value.length && response.length) {
        // merge the previously selected messages into the new list so we can replace them
        messages.value.forEach((previousMessage) => {
          const receivedMessage = response.find((m) => m.id === previousMessage.id);
          if (receivedMessage) {
            if (previousMessage.last_modified == receivedMessage.last_modified) {
              receivedMessage.retryInProgress = previousMessage.retryInProgress;
              receivedMessage.deleteInProgress = previousMessage.deleteInProgress;
            }

            receivedMessage.selected = previousMessage.selected;
          }
        });
      }

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

function retryRequested(id) {
  useShowToast("info", "Info", "Message retry requested...");
  return useRetryMessages([id])
  .then(() => {
    const message = messages.value.find((m) => m.id == id);
    if (message) {
      message.retryInProgress = true;
      message.selected = false;
    }
  });
}

function retrySelected() {
  const selectedMessages = messageList.value.getSelectedMessages();
  useShowToast("info", "Info", "Retrying " + selectedMessages.length + " messages...");
  return useRetryMessages(selectedMessages.map((m) => m.id))
  .then(() => {
    messageList.value.deselectAll();
    selectedMessages.forEach((m) => (m.retryInProgress = true));
  });
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

  function parseObject(obj, propertiesToSkip, path) {
    if (path == undefined) path = "";

    const type = typeof obj;
    let d = {};

    if (type == "array" || type == "object") {
      for (let i in obj) {
        const newD = parseObject(obj[i], propertiesToSkip, path + i + ".");
        d = Object.assign(d, newD);
      }
      return d;
    } else if (type == "number" || type == "string" || type == "boolean" || type == "null") {
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

  var preparedMessagesForExport = [];
  for (var i = 0; i < selectedMessages.length; i++) {
    preparedMessagesForExport.push(parseObject(selectedMessages[i], propertiesToSkip));
  }

  var csvStr = toCSV(preparedMessagesForExport);
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

function deleteSelectedMessages() {
  const selectedMessages = messageList.value.getSelectedMessages();

  useShowToast("info", "Info", "Deleting " + selectedMessages.length + " messages...");
  usePatchToServiceControl(
    "errors/archive",
    selectedMessages.map((m) => m.id)
  ).then(() => {
    messageList.value.deselectAll();
    selectedMessages.forEach((m) => (m.deleteInProgress = true));
  });
}

function nextPage() {
  pageNumber.value = pageNumber.value + 1;
  if (pageNumber.value > numberOfPages.value) {
    pageNumber.value = numberOfPages.value;
  }
  loadMessages();
}

function previousPage() {
  pageNumber.value = pageNumber.value - 1;
  if (pageNumber.value == 0) {
    pageNumber.value = 1;
  }
  loadMessages();
}

function setPage(page) {
  pageNumber.value = page;
  loadMessages();
}

onUnmounted(() => {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }
});

onMounted(() => {
  loadMessages();

  refreshInterval = setInterval(() => {
    loadMessages();
  }, 5000);
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <ServiceControlNotAvailable />
    <template v-if="!connectionState.unableToConnect">
      <section name="message_groups">
        <div class="row">
          <div class="col-9">
            <div class="btn-toolbar">
              <button type="button" class="btn btn-default select-all" @click="selectAll" v-if="!isAnythingSelected()">Select all</button>
              <button type="button" class="btn btn-default select-all" @click="deselectAll" v-if="isAnythingSelected()">Clear selection</button>
              <button type="button" class="btn btn-default" @click="retrySelected()" :disabled="!isAnythingSelected()"><i class="fa fa-repeat"></i> Retry {{ numberSelected() }} selected</button>
              <button type="button" class="btn btn-default" @click="showDelete = true" :disabled="!isAnythingSelected()"><i class="fa fa-trash"></i> Delete {{ numberSelected() }} selected</button>
              <button type="button" class="btn btn-default" @click="exportSelected()" :disabled="!isAnythingSelected()"><i class="fa fa-download"></i> Export {{ numberSelected() }} selected</button>
              <button type="button" class="btn btn-default" v-if="isGroupDetails" confirm-title="Are you sure you want to retry the whole group?" confirm-message="Retrying a whole group can take some time and put extra load on your system. Are you sure you want to retry all these messages?" confirm-click="vm.retryExceptionGroup(vm.selectedExceptionGroup)"><i class="fa fa-repeat"></i> Retry all</button>
            </div>
          </div>
          <div class="col-3">
            <GroupAndOrderBy @sort-updated="sortGroups" :hideGroupBy="true" :sortOptions="sortOptions" sortSavePrefix="all_failed_"></GroupAndOrderBy>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <MessageList :messages="messages" @retry-requested="retryRequested" ref="messageList"></MessageList>
          </div>
        </div>
        <div class="row">
          <div class="col align-self-center">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: pageNumber == 1 }">
                <a class="page-link" href="#" @click.prevent="previousPage">Previous</a>
              </li>
              <li v-for="n in numberOfPages" class="page-item" :class="{ active: pageNumber == n }" :key="n">
                <a @click.prevent="setPage(n)" class="page-link" href="#">{{ n }}</a>
              </li>
              <li class="page-item">
                <a class="page-link" href="#" @click.prevent="nextPage">Next</a>
              </li>
            </ul>
          </div>
        </div>
        <Teleport to="#modalDisplay">
          <FailedMessageDelete
            v-if="showDelete === true"
            @cancel="showDelete = false"
            @confirm="
              showDelete = false;
              deleteSelectedMessages();
            "
          ></FailedMessageDelete>
        </Teleport>
      </section>
    </template>
  </template>
</template>

<style>
.select-all {
  width: 127px;
}

.msg-list-dropdown {
  margin: 1px 0 0 0 !important;
  padding-right: 0;
}

.msg-group-menu {
  margin: 21px 0px 0 6px;
  float: right;
  padding-top: 12px;
}

.msg-group-menu > .control-label {
  float: none;
}

.btn.sp-btn-menu {
  padding-left: 16px;
  background: none;
  border: none;
  color: #00a3c4;
  padding-right: 0;
}

.sp-btn-menu:hover {
  background: none;
  border: none;
  color: #00a3c4;
  text-decoration: underline;
}

.btn-toolbar > .btn-default:hover {
  color: #333;
  background-color: #e6e6e6;
  border-color: #adadad;
}

.metadata .label-important {
  padding: 2px 10px;
  border-radius: 3px;
  color: white;
  font-size: 13px;
  font-weight: bold;
  margin-right: 20px;
}
</style>
