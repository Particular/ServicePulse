<script setup>
import { ref } from "vue";
import { licenseStatus } from "../../composables/serviceLicense.js";
import { connectionState } from "../../composables/serviceServiceControl.js";
import LicenseExpired from "../../components/LicenseExpired.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import LastTenOperations from "../failedmessages/LastTenOperations.vue";
import MessageGroupList from "../failedmessages/MessageGroupList.vue";
import GroupAndOrderBy from "./GroupAndOrderBy.vue";

const messageGroupList = ref();
const forceReRenderKey = ref(0);
const sortMethod = ref((firstElement, secondElement) => {
  return firstElement.title < secondElement.title ? -1 : 1;
}); // default sort by title in ASC order

function sortGroups(sort) {
  sortMethod.value = sort.sort;

  // force a re-render of the messagegroup list
  forceReRenderKey.value += 1;
}

function classifierUpdated(classifier) {
  messageGroupList.value.loadFailedMessageGroups(classifier);
}

const sortOptions = [
  {
    description: "Name",
    selector: function (group) {
      return group.title;
    },
    icon: "bi-sort-alpha-",
  },
  {
    description: "Number of messages",
    selector: function (group) {
      return group.count;
    },
    icon: "bi-sort-numeric-",
  },
  {
    description: "First Failed Time",
    selector: function (group) {
      return group.first;
    },
    icon: "bi-sort-",
  },
  {
    description: "Last Failed Time",
    selector: function (group) {
      return group.last;
    },
    icon: "bi-sort-",
  },
  {
    description: "Last Retried Time",
    selector: function (group) {
      return group.last_operation_completion_time;
    },
    icon: "bi-sort-",
  },
];
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <ServiceControlNotAvailable />
    <template v-if="!connectionState.unableToConnect">
      <section name="message_groups">
        <LastTenOperations></LastTenOperations>
        <div class="row">
          <div class="col-xs-6 list-section">
            <h3>Failed message group</h3>
          </div>
          <div class="col-xs-6 toolbar-menus no-side-padding">
            <GroupAndOrderBy @sort-updated="sortGroups" @classifier-updated="classifierUpdated" :sortOptions="sortOptions"></GroupAndOrderBy>
          </div>
        </div>
        <div class="box">
          <div class="row">
            <div class="col-sm-12">
              <div class="list-section">
                <div class="col-sm-12 form-group">
                  <MessageGroupList :key="forceReRenderKey" :sortFunction="sortMethod" ref="messageGroupList"></MessageGroupList>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </template>
</template>
