<script setup>
import { ref, onMounted } from "vue";
import { licenseStatus } from "../../composables/serviceLicense.js";
import { connectionState } from "../../composables/serviceServiceControl.js";
import { useFetchFromServiceControl } from "../../composables/serviceServiceControlUrls.js";
import LicenseExpired from "../../components/LicenseExpired.vue";
import GroupAndOrderBy from "./GroupAndOrderBy.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import MessageList from "./MessageList.vue";

const messageList = ref();
const totalCount = ref(0);
const messages = ref([]);
const sortMethod = ref({});
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
  sortMethod.value = sort.sort;
}

function loadMessages(page, sortBy, direction) {
  if (typeof sortBy === "undefined") sortBy = "time_of_failure";
  if (typeof direction === "undefined") direction = "desc"
  if (typeof page === "undefined") page = 1;
  
  return useFetchFromServiceControl(`errors?status=unresolved&page=${page}&sort=${sortBy}&direction=${direction}`)
    .then(response => {
      totalCount.value = parseInt(response.headers.get("Total-Count"));
      return response.json();
    })
    .then(response => {
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

function retrySelected() {
  var ids = messageList.value.getSelectedMessageIds();
}

function numberSelected() {
  return (messageList?.value?.getSelectedMessageIds()?.length ?? 0);
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

onMounted(() => {
  loadMessages();
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
              <button type="button" class="btn btn-default" @click="retrySelected()" ng-disabled="vm.selectedIds.length == 0"><i class="fa fa-repeat"></i> Retry {{ numberSelected() }} selected</button>
              <button type="button" class="btn btn-default" confirm-title="Are you sure you want to delete the selected messages?" confirm-message="If you delete, these messages won't be available for retrying unless they're later restored." confirm-click="vm.archiveSelected()" ng-disabled="vm.selectedIds.length == 0"><i class="fa fa-trash"></i> Delete {{ numberSelected() }} selected</button>
              <button type="button" class="btn btn-default" ng-click="vm.exportSelected()" ng-disabled="vm.selectedIds.length == 0"><i class="fa fa-download"></i> Export {{ numberSelected() }} selected</button>
              <button type="button" class="btn btn-default" confirm-title="Are you sure you want to retry the whole group?" confirm-message="Retrying a whole group can take some time and put extra load on your system. Are you sure you want to retry all these messages?" confirm-click="vm.retryExceptionGroup(vm.selectedExceptionGroup)"><i class="fa fa-repeat"></i> Retry all</button>
            </div>
          </div>
          <div class="col-3">
            <GroupAndOrderBy @sort-updated="sortGroups" :hideGroupBy="true" :sortOptions="sortOptions" sortSavePrefix="all_failed_"></GroupAndOrderBy>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <MessageList :messages="messages" ref="messageList"></MessageList>
          </div>
        </div>
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
</style>
