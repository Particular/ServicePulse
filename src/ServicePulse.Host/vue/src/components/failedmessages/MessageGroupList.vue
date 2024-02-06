<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { stats } from "../../composables/serviceServiceControl";
import { useShowToast } from "../../composables/toast";
import { useDeleteNote, useEditOrCreateNote, useGetExceptionGroups, useArchiveExceptionGroup, useAcknowledgeArchiveGroup, useRetryExceptionGroup } from "../../composables/serviceMessageGroup";
import NoData from "../NoData.vue";
import TimeSince from "../TimeSince.vue";
import FailedMessageGroupNoteEdit from "./FailedMessageGroupNoteEdit.vue";
import ConfirmDialog from "../ConfirmDialog.vue";

const emit = defineEmits(["InitialLoadComplete", "ExceptionGroupCountUpdated"]);

let pollingFaster = false;
let refreshInterval = undefined;
const props = defineProps({
  sortFunction: Function,
});
const router = useRouter();
let groupsWithNotesAdded = [];
let savedGroupBy = null;

const selectedGroup = ref({
  groupid: "",
  messagecount: "",
  comment: "",
});

const exceptionGroups = ref([]);
const loadingData = ref(true);
const initialLoadComplete = ref(false);
const showDeleteNoteModal = ref(false);
const showEditNoteModal = ref(false);
const showDeleteGroupModal = ref(false);
const showRetryGroupModal = ref(false);
const noteSaveSuccessful = ref(null);
const groupDeleteSuccessful = ref(null);
const groupRetrySuccessful = ref(null);

async function getExceptionGroups(classifier) {
  const result = await useGetExceptionGroups(classifier);
  if (props.sortFunction) {
    result.sort(props.sortFunction);
  }

  groupsWithNotesAdded.forEach((note) => {
    const groupFromSC = result.find((group) => {
      return group.id === note.groupId;
    });
    if (!groupFromSC.comment) {
      groupFromSC.comment = note.comment;
    } else {
      note.alreadySaved = true;
    }
  });

  exceptionGroups.value = result;
  if (result.length > 0) {
    // need a map in some ui state for controlling animations
    exceptionGroups.value = result.map(initializeGroupState);

    if (exceptionGroups.value.length !== stats.number_of_exception_groups) {
      stats.number_of_exception_groups = exceptionGroups.value.length;
      emit("ExceptionGroupCountUpdated", stats.number_of_exception_groups);
    }
  }

  groupsWithNotesAdded = groupsWithNotesAdded.filter((note) => !note.alreadySaved);
}
function initializeGroupState(group, index) {
  group.index = index;

  let operationStatus = (group.operation_status ? group.operation_status.toLowerCase() : null) || "none";
  if (operationStatus === "preparing" && group.operation_progress === 1) {
    operationStatus = "queued";
  }
  group.workflow_state = createWorkflowState(operationStatus, group.operation_progress, group.operation_failed);
  return group;
}

async function loadFailedMessageGroups(groupBy) {
  loadingData.value = true;

  if (groupBy) {
    savedGroupBy = groupBy;
  }

  await getExceptionGroups(savedGroupBy);
  loadingData.value = false;
  initialLoadComplete.value = true;

  emit("InitialLoadComplete");
}

//delete comment note
function deleteNote(group) {
  noteSaveSuccessful.value = null;
  selectedGroup.value.groupid = group.id;
  showDeleteNoteModal.value = true;
}

async function saveDeleteNote(group, hideToastMessage) {
  showDeleteNoteModal.value = false;

  const result = await useDeleteNote(group.groupid);
  if (result.message === "success") {
    noteSaveSuccessful.value = true;
    if (!hideToastMessage) {
      useShowToast("info", "Info", "Note deleted succesfully");
    }

    loadFailedMessageGroups(); //reload the groups
  } else {
    noteSaveSuccessful.value = false;
    if (!hideToastMessage) {
      useShowToast("error", "Error", "Failed to delete a Note:");
    }
  }
}

// create comment note
async function saveNote(group) {
  noteSaveSuccessful.value = null;
  showEditNoteModal.value = false;

  groupsWithNotesAdded.push({ groupId: group.groupid, comment: group.comment });

  const result = await useEditOrCreateNote(group.groupid, group.comment);
  if (result.message === "success") {
    noteSaveSuccessful.value = true;
    useShowToast("info", "Info", "Note updated successfully");
    loadFailedMessageGroups(); //reload the groups
  } else {
    noteSaveSuccessful.value = false;
    useShowToast("error", "Error", "Failed to update Note:" + result.message);
  }
}

function saveCreatedNote(group) {
  saveNote(group);
}

function saveEditedNote(group) {
  saveNote(group);
}

function editNote(group) {
  noteSaveSuccessful.value = null;
  selectedGroup.value.groupid = group.id;
  selectedGroup.value.comment = group.comment;
  showEditNoteModal.value = true;
}

//delete a group
const statusesForArchiveOperation = ["archivestarted", "archiveprogressing", "archivefinalizing", "archivecompleted"];
function deleteGroup(group) {
  groupDeleteSuccessful.value = null;
  selectedGroup.value.groupid = group.id;
  showDeleteGroupModal.value = true;
}

async function saveDeleteGroup(group) {
  showDeleteGroupModal.value = false;
  group.workflow_state = { status: "archivestarted", message: "Delete request initiated..." };

  // We've started a delete, so increase the polling frequency
  changeRefreshInterval(1000);

  saveDeleteNote(group, true); // delete comment note when group is archived
  const result = await useArchiveExceptionGroup(group.groupid);
  if (result.message === "success") {
    groupDeleteSuccessful.value = true;
    useShowToast("info", "info", "Group delete started...");
  } else {
    groupDeleteSuccessful.value = false;
    useShowToast("error", "Error", "Failed to delete the group:" + result.message);
  }
}

//create workflow state
function createWorkflowState(optionalStatus, optionalTotal, optionalFailed) {
  if (optionalTotal && optionalTotal <= 1) {
    optionalTotal = optionalTotal * 100;
  }
  return {
    status: optionalStatus || "working",
    total: Math.round(optionalTotal || 0),
    failed: optionalFailed || false,
  };
}

//getClassesForArchiveOperation
function getClassesForArchiveOperation(stepStatus, currentStatus) {
  return getClasses(stepStatus, currentStatus, statusesForArchiveOperation);
}

//Retry operation
function retryGroup(group) {
  groupRetrySuccessful.value = null;
  selectedGroup.value.groupid = group.id;
  selectedGroup.value.messagecount = group.count;
  showRetryGroupModal.value = true;
}

async function saveRetryGroup(group) {
  showRetryGroupModal.value = false;
  group.workflow_state = { status: "waiting", message: "Retry Group Request Enqueued..." };

  // We've started a retry, so increase the polling frequency
  changeRefreshInterval(1000);

  saveDeleteNote(group, true);
  const result = await useRetryExceptionGroup(group.groupid);
  if (result.message === "success") {
    groupRetrySuccessful.value = true;
  } else {
    groupRetrySuccessful.value = false;
    useShowToast("error", "Error", "Failed to retry the group:" + result.message);
  }
}

const statusesForRetryOperation = ["waiting", "preparing", "queued", "forwarding"];
function getClassesForRetryOperation(stepStatus, currentStatus) {
  if (currentStatus === "queued") {
    currentStatus = "forwarding";
  }
  return getClasses(stepStatus, currentStatus, statusesForRetryOperation);
}

//getClasses
var getClasses = function (stepStatus, currentStatus, statusArray) {
  const indexOfStep = statusArray.indexOf(stepStatus);
  const indexOfCurrent = statusArray.indexOf(currentStatus);
  if (indexOfStep > indexOfCurrent) {
    return "left-to-do";
  } else if (indexOfStep === indexOfCurrent) {
    return "active";
  } else {
    return "completed";
  }
};

const acknowledgeGroup = async function (group) {
  const result = await useAcknowledgeArchiveGroup(group.id);
  if (result.message === "success") {
    if (group.operation_status === "ArchiveCompleted") {
      useShowToast("info", "Info", "Group deleted succesfully");
    } else {
      useShowToast("info", "Info", "Group retried succesfully");
    }
    loadFailedMessageGroups(); //reload the groups
  } else {
    useShowToast("error", "Error", "Acknowledging Group Failed':" + result.message);
  }
};

function isBeingArchived(status) {
  return status === "archivestarted" || status === "archiveprogressing" || status === "archivefinalizing" || status === "archivecompleted";
}

function isBeingRetried(group) {
  return group.workflow_state.status !== "none" && (group.workflow_state.status !== "completed" || group.need_user_acknowledgement === true) && !isBeingArchived(group.workflow_state.status);
}

function clearInMemoryData() {
  groupsWithNotesAdded = [];
}

function navigateToGroup($event, groupId) {
  if ($event.target.localName !== "button") {
    router.push({ name: "message-groups", params: { groupId: groupId } });
  }
}

function isRetryOrDeleteOperationInProgress() {
  return exceptionGroups.value.some((group) => group.operation_status !== "None" && group.operation_status !== "ArchiveCompleted" && group.operation_status !== "Completed");
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

    loadFailedMessageGroups();
  }, milliseconds);
}

onUnmounted(() => {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }
});

onMounted(() => {
  // Initialize the poll interval to 5 seconds
  changeRefreshInterval(5000);
});

defineExpose({
  loadFailedMessageGroups,
  clearInMemoryData,
});
</script>

<template>
  <div class="messagegrouplist">
    <div class="row">
      <div class="col-sm-12">
        <no-data v-if="exceptionGroups.length === 0 && !loadingData" title="message groups" message="There are currently no grouped message failures"></no-data>
      </div>
    </div>

    <div class="row">
      <div class="col-sm-12 no-mobile-side-padding">
        <div v-if="exceptionGroups.length > 0">
          <div
            class="row box box-group wf-{{group.workflow_state.status}} failed-message-group repeat-modify"
            v-for="(group, index) in exceptionGroups"
            :key="index"
            :disabled="group.count == 0"
            @mouseenter="group.hover2 = true"
            @mouseleave="group.hover2 = false"
            @click="navigateToGroup($event, group.id)"
          >
            <div class="col-sm-12 no-mobile-side-padding">
              <div class="row">
                <div class="col-sm-12 no-side-padding">
                  <div class="row box-header">
                    <div class="col-sm-12 no-side-padding">
                      <p class="lead break" :class="{ 'msg-type-hover': group.hover2, 'msg-type-hover-off': group.hover3 }">{{ group.title }}</p>
                      <p class="metadata" v-if="!isBeingRetried(group) && !isBeingArchived(group.workflow_state.status)">
                        <span class="metadata">
                          <i aria-hidden="true" class="fa fa-envelope"></i>
                          {{ group.count }} message<span v-if="group.count > 1">s</span>
                          <span v-if="group.operation_remaining_count > 0"> (currently retrying {{ group.operation_remaining_count }} </span>
                        </span>

                        <span class="metadata">
                          <i aria-hidden="true" class="fa fa-clock-o"></i>
                          First failed:
                          <time-since :date-utc="group.first"></time-since>
                        </span>

                        <span class="metadata">
                          <i aria-hidden="true" class="fa fa-clock-o"></i> Last failed:
                          <time-since :date-utc="group.last"></time-since>
                        </span>

                        <span class="metadata">
                          <i aria-hidden="true" class="fa fa-repeat"></i> Last retried:
                          <time-since :date-utc="group.operation_completion_time"></time-since>
                        </span>
                      </p>
                    </div>
                  </div>

                  <div class="row" v-if="!isBeingRetried(group) && !isBeingArchived(group.workflow_state.status)">
                    <div class="col-sm-12 no-side-padding">
                      <div class="note" v-if="group.comment">
                        <span> <strong>NOTE:</strong> {{ group.comment }} </span>
                      </div>
                    </div>
                  </div>
                  <div class="row" v-if="!isBeingRetried(group) && !isBeingArchived(group.workflow_state.status)">
                    <div class="col-sm-12 no-side-padding">
                      <button
                        type="button"
                        class="btn btn-link btn-sm"
                        :disabled="group.count == 0 || isBeingRetried(group)"
                        @mouseenter="group.hover3 = true"
                        @mouseleave="group.hover3 = false"
                        v-if="exceptionGroups.length > 0"
                        @click="retryGroup(group)"
                      >
                        <i aria-hidden="true" class="fa fa-repeat no-link-underline">&nbsp;</i>Request retry
                      </button>

                      <button
                        type="button"
                        class="btn btn-link btn-sm"
                        :disabled="group.count == 0 || isBeingRetried(group)"
                        @mouseenter="group.hover3 = true"
                        @mouseleave="group.hover3 = false"
                        v-if="exceptionGroups.length > 0"
                        @click="deleteGroup(group)"
                      >
                        <i aria-hidden="true" class="fa fa-trash no-link-underline">&nbsp;</i>Delete group
                      </button>
                      <button type="button" class="btn btn-link btn-sm" v-if="!group.comment" @click="editNote(group)"><i aria-hidden="true" class="fa fa-sticky-note no-link-underline">&nbsp;</i>Add note</button>
                      <button type="button" class="btn btn-link btn-sm" v-if="group.comment" @click="editNote(group)"><i aria-hidden="true" class="fa fa-pencil no-link-underline">&nbsp;</i>Edit note</button>
                      <button type="button" class="btn btn-link btn-sm" v-if="group.comment" @click="deleteNote(group)"><i aria-hidden="true" class="fa fa-eraser no-link-underline">&nbsp;</i>Remove note</button>
                    </div>
                  </div>

                  <!--isBeingRetried-->
                  <div class="row" v-if="isBeingRetried(group)">
                    <div class="col-sm-12 no-side-padding">
                      <div class="panel panel-default panel-retry">
                        <div class="panel-body">
                          <ul class="retry-request-progress">
                            <li v-if="group.workflow_state.status !== 'completed'" v-bind:class="getClassesForRetryOperation('waiting', group.workflow_state.status)">
                              <div class="bulk-retry-progress-status">Initialize retry request...</div>
                            </li>
                            <li v-if="group.workflow_state.status !== 'completed'" v-bind:class="getClassesForRetryOperation('preparing', group.workflow_state.status)">
                              <div class="row">
                                <div class="col-xs-12 col-sm-4 col-md-3 no-side-padding">
                                  <div class="bulk-retry-progress-status">Prepare messages...</div>
                                </div>

                                <div class="col-xs-12 col-sm-6">
                                  <div class="progress bulk-retry-progress" v-if="group.workflow_state.status === 'preparing'">
                                    <div
                                      class="progress-bar progress-bar-striped active"
                                      role="progressbar"
                                      aria-valuenow="{{group.workflow_state.total}}"
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                      :style="{ 'min-width': '2em', width: group.workflow_state.total + '%' }"
                                    >
                                      {{ group.workflow_state.total }}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                            <li v-if="group.workflow_state.status !== 'completed'" v-bind:class="getClassesForRetryOperation('forwarding', group.workflow_state.status)">
                              <div class="row">
                                <div class="col-xs-9 col-sm-4 col-md-3 no-side-padding">
                                  <div class="bulk-retry-progress-status">Send messages to retry...</div>
                                </div>
                                <div class="col-xs-3 col-sm-3 retry-op-queued" v-if="group.workflow_state.status === 'queued'">(Queued)</div>
                                <div class="col-xs-12 col-sm-6">
                                  <div class="progress bulk-retry-progress" v-if="group.workflow_state.status === 'forwarding'">
                                    <div
                                      class="progress-bar progress-bar-striped active"
                                      role="progressbar"
                                      aria-valuenow="{{group.workflow_state.total}}"
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                      :style="{ 'min-width': '2em', width: group.workflow_state.total + '%' }"
                                    >
                                      {{ group.workflow_state.total }}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                            <li v-if="group.workflow_state.status === 'completed'">
                              <div class="retry-completed bulk-retry-progress-status">Retry request completed</div>
                              <button type="button" class="btn btn-default btn-primary btn-xs btn-retry-dismiss" v-if="group.need_user_acknowledgement == true" @click="acknowledgeGroup(group)">Dismiss</button>
                              <div class="danger sc-restart-warning" v-if="group.workflow_state.failed">
                                <i aria-hidden="true" class="fa fa-exclamation-triangle danger"></i> <strong>WARNING: </strong>Not all messages will be retried because ServiceControl had to restart. You need to request retrying the remaining
                                messages.
                              </div>
                            </li>
                          </ul>

                          <div class="op-metadata">
                            <span class="metadata">
                              <i aria-hidden="true" class="fa fa-envelope"></i> {{ group.workflow_state.status === "completed" ? "Messages sent:" : "Messages to send:" }} {{ group.operation_remaining_count || group.count }}
                            </span>
                            <span class="metadata"><i aria-hidden="true" class="fa fa-clock-o"></i> Retry request started: <time-since :date-utc="group.operation_start_time"></time-since></span>
                            <span class="metadata" v-if="group.workflow_state.status === 'completed'"
                              ><i aria-hidden="true" class="fa fa-clock-o"></i> Retry request completed: <time-since :date-utc="group.operation_completion_time"></time-since
                            ></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!--isBeingArchived-->
                  <div class="row" v-if="isBeingArchived(group.workflow_state.status)">
                    <div class="col-sm-12 no-side-padding">
                      <div class="panel panel-default panel-retry">
                        <div class="panel-body">
                          <ul class="retry-request-progress">
                            <li v-if="group.workflow_state.status !== 'archivecompleted'" v-bind:class="getClassesForArchiveOperation('archivestarted', group.workflow_state.status)">
                              <div class="bulk-retry-progress-status">Initialize delete request...</div>
                            </li>
                            <li v-if="group.workflow_state.status !== 'archivecompleted'" v-bind:class="getClassesForArchiveOperation('archiveprogressing', group.workflow_state.status)">
                              <div class="row">
                                <div class="col-xs-12 col-sm-4 col-md-3 no-side-padding">
                                  <div class="bulk-retry-progress-status">Delete request in progress...</div>
                                </div>
                                <div class="col-xs-12 col-sm-6">
                                  <div class="progress bulk-retry-progress" v-if="group.workflow_state.status === 'archiveprogressing'">
                                    <div
                                      class="progress-bar progress-bar-striped active"
                                      role="progressbar"
                                      aria-valuenow="{{group.workflow_state.total}}"
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                      :style="{ 'min-width': '2em', width: group.workflow_state.total + '%' }"
                                    >
                                      {{ group.workflow_state.total }} %
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                            <li v-if="group.workflow_state.status !== 'archivecompleted'" v-bind:class="getClassesForArchiveOperation('archivefinalizing', group.workflow_state.status)">
                              <div class="row">
                                <div class="col-xs-12 col-sm-4 col-md-3 no-side-padding">
                                  <div class="bulk-retry-progress-status">Cleaning up...</div>
                                </div>
                              </div>
                            </li>
                            <li v-if="group.workflow_state.status === 'archivecompleted'">
                              <div class="retry-completed bulk-retry-progress-status">Delete request completed</div>
                              <button type="button" class="btn btn-default btn-primary btn-xs btn-retry-dismiss" v-if="group.need_user_acknowledgement == true" @click="acknowledgeGroup(group)">Dismiss</button>
                            </li>
                          </ul>

                          <div class="op-metadata">
                            <span class="metadata">
                              <i aria-hidden="true" class="fa fa-clock-o"></i>
                              Delete request started: <time-since :date-utc="group.operation_start_time"></time-since>
                            </span>
                            <span class="metadata">
                              <i aria-hidden="true" class="fa fa-envelope"></i>
                              Messages left to delete:
                              {{ group.operation_remaining_count || 0 }}
                            </span>
                            <span class="metadata">
                              <i aria-hidden="true" class="fa fa-envelope"></i>
                              Messages deleted:
                              {{ group.operation_messages_completed_count || 0 }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--modal display - create new/edit comment note-->
  <Teleport to="#modalDisplay">
    <FailedMessageGroupNoteEdit
      v-if="showEditNoteModal === true"
      v-bind="selectedGroup"
      :group_id="selectedGroup.groupid"
      @cancelEditNote="showEditNoteModal = false"
      @createNoteConfirmed="saveCreatedNote"
      @editNoteConfirmed="saveEditedNote"
    ></FailedMessageGroupNoteEdit>
  </Teleport>

  <!--modal display - delete group-->
  <Teleport to="#modalDisplay">
    <ConfirmDialog
      v-if="showDeleteGroupModal"
      @cancel="showDeleteGroupModal = false"
      @confirm="
        showDeleteGroupModal = false;
        saveDeleteGroup(selectedGroup);
      "
      :heading="'Are you sure you want to delete this group?'"
      :body="'Messages that are deleted will be cleaned up according to the ServiceControl retention policy, and aren\'t available for retrying unless they\'re restored.'"
    ></ConfirmDialog>

    <ConfirmDialog
      v-if="showRetryGroupModal"
      @cancel="showRetryGroupModal = false"
      @confirm="
        showRetryGroupModal = false;
        saveRetryGroup(selectedGroup);
      "
      :heading="'Are you sure you want to retry this group?'"
      :body="`Retrying a whole group can take some time and put extra load on your system. Are you sure you want to retry this group of ${selectedGroup.messagecount} messages?`"
    ></ConfirmDialog>

    <ConfirmDialog
      v-if="showDeleteNoteModal"
      @cancel="showDeleteNoteModal = false"
      @confirm="
        showDeleteNoteModal = false;
        saveDeleteNote(selectedGroup);
      "
      :heading="'Are you sure you want to delete this note?'"
      :body="`Deleted note will not be available.`"
    ></ConfirmDialog>
  </Teleport>
</template>

<style>
.fake-link i {
  padding-right: 0.2em;
}

.toolbar-menus > .msg-group-menu {
  margin: 0;
}

.failed-message-group {
  cursor: pointer;
}
</style>
