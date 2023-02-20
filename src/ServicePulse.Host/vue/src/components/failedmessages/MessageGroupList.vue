<script setup>
import { ref, onMounted } from "vue";
import NoData from "../NoData.vue";
import TimeSince from "../TimeSince.vue";
import FailedMessageGroupNoteDelete from "./FailedMessageGroupNoteDelete.vue";
import FailedMessageGroupNoteEdit from "./FailedMessageGroupNoteEdit.vue";
import FailedMessageGroupDelete from "./FailedMessageGroupDelete.vue";
import FailedMessageGroupRetry from "./FailedMessageGroupRetry.vue";
import { stats } from "../../composables/serviceServiceControl.js";
import { useShowToast } from "../../composables/toast.js";
import { useDeleteNote, useEditOrCreateNote, useGetExceptionGroups, useArchiveExceptionGroup, useAcknowledgeArchiveGroup, useRetryExceptionGroup } from "../../composables/serviceMessageGroup.js";

const props = defineProps({
  sortFunction: Object
});


const exceptionGroups = ref([]);
const loadingData = ref(true);
const initialLoadComplete = ref(false);
const emit = defineEmits(["InitialLoadComplete", "ExceptionGroupCountUpdated"]);

const showDeleteNoteModal = ref(false);
const showEditNoteModal = ref(false);
const showDeleteGroupModal = ref(false);
const showRetryGroupModal = ref(false);

const selectedGroup = ref({
  groupid: "",
  messagecount: "",
  comment: "",
});
const noteSaveSuccessful = ref(null);
const groupDeleteSuccessful = ref(null);
const groupRetrySuccessful = ref(null);

function getExceptionGroups() {
  exceptionGroups.value = [];

  return useGetExceptionGroups().then((result) => {
    result.sort(props.sortFunction);

    exceptionGroups.value = result;
    if (result.length > 0) {
      // need a map in some ui state for controlling animations
      exceptionGroups.value = result.map(initializeGroupState);

      if (exceptionGroups.value.length !== stats.number_of_exception_groups) {
        stats.number_of_exception_groups = exceptionGroups.value.length;
        emit("ExceptionGroupCountUpdated", stats.number_of_exception_groups);
      }
    }
  });
}
function initializeGroupState(group) {
  var operationStatus = (group.operation_status ? group.operation_status.toLowerCase() : null) || "none";
  if (operationStatus === "preparing" && group.operation_progress === 1) {
    operationStatus = "queued";
  }
  group.workflow_state = createWorkflowState(operationStatus, group.operation_progress, group.operation_failed);
  return group;
}

function initialLoad() {
  loadingData.value = true;
  initialLoadComplete.value = false;

  getExceptionGroups().then(() => {
    loadingData.value = false;
    initialLoadComplete.value = true;
    emit("InitialLoadComplete");
  });
}
//delete comment note
function deleteNote(group) {
  noteSaveSuccessful.value = null;
  selectedGroup.value.groupid = group.id;
  showDeleteNoteModal.value = true;
}

function saveDeleteNote(groupId) {
  showDeleteNoteModal.value = false;

  useDeleteNote(groupId).then((result) => {
    if (result.message === "success") {
      noteSaveSuccessful.value = true;
      useShowToast("info", "Info", "Note deleted succesfully");
      getExceptionGroups(); //reload the groups
    } else {
      noteSaveSuccessful.value = false;
      useShowToast("error", "Error", "Failed to delete a Note:");
    }
  });
}

// create comment note
function saveNote(group) {
  noteSaveSuccessful.value = null;
  showEditNoteModal.value = false;
  useEditOrCreateNote(group.groupid, group.comment).then((result) => {
    if (result.message === "success") {
      noteSaveSuccessful.value = true;
      useShowToast("info", "Info", "Note updated successfully");
      getExceptionGroups(); //reload the groups
    } else {
      noteSaveSuccessful.value = false;
      useShowToast("error", "Error", "Failed to update Note:" + result.message);
    }
  });
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
var statusesForArchiveOperation = ["archivestarted", "archiveprogressing", "archivefinalizing", "archivecompleted"];
function deleteGroup(group) {
  groupDeleteSuccessful.value = null;
  selectedGroup.value.groupid = group.id;
  showDeleteGroupModal.value = true;
}
function saveDeleteGroup(group) {
  showDeleteGroupModal.value = false;
  group.workflow_state = { status: "archivestarted", message: "Delete request initiated..." };

  saveDeleteNote(group.id); //delete comment note when group is archived
  useArchiveExceptionGroup(group.groupid).then((result) => {
    if (result.message === "success") {
      groupDeleteSuccessful.value = true;
      emit("ArchiveGroupRequestAccepted", group);
    } else {
      groupDeleteSuccessful.value = false;
      useShowToast("error", "Error", "Failed to delete the group:" + result.message);
    }
  });
}

//create workflow state
function createWorkflowState(optionalStatus, optionalTotal, optionalFailed) {
  if (optionalTotal && optionalTotal <= 1) {
    optionalTotal = optionalTotal * 100;
  }
  return {
    status: optionalStatus || "working",
    total: optionalTotal || 0,
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
function saveRetryGroup(group) {
  showRetryGroupModal.value = false;
  group.workflow_state = { status: "waiting", message: "Retry Group Request Enqueued..." };

  saveDeleteNote(group.id);
  useRetryExceptionGroup(group.groupid).then((result) => {
    if (result.message === "success") {
      groupRetrySuccessful.value = true;
      emit("RetryGroupRequestAccepted", group);
    } else {
      groupRetrySuccessful.value = false;
      useShowToast("error", "Error", "Failed to retry the group:" + result.message);
    }
  });
}
var statusesForRetryOperation = ["waiting", "preparing", "queued", "forwarding"];
function getClassesForRetryOperation(stepStatus, currentStatus) {
  if (currentStatus === "queued") {
    currentStatus = "forwarding";
  }
  return getClasses(stepStatus, currentStatus, statusesForRetryOperation);
}

//getClasses
var getClasses = function (stepStatus, currentStatus, statusArray) {
  var indexOfStep = statusArray.indexOf(stepStatus);
  var indexOfCurrent = statusArray.indexOf(currentStatus);
  if (indexOfStep > indexOfCurrent) {
    return "left-to-do";
  } else if (indexOfStep === indexOfCurrent) {
    return "active";
  } else {
    return "completed";
  }
};

var acknowledgeGroup = function (group) {
  useAcknowledgeArchiveGroup(group.id).then((result) => {
    if (result.message === "success") {
      // exceptionGroups.splice(exceptionGroups.indexOf(group), 1);
      useShowToast("info", "Info", "Group retried succesfully");
      getExceptionGroups(); //reload the groups
    } else {
      useShowToast("error", "Error", "Acknowledging Group Failed':" + result.message);
    }
  });
};

function isBeingArchived(status) {
  return status === "archivestarted" || status === "archiveprogressing" || status === "archivefinalizing" || status === "archivecompleted";
}
function isBeingRetried(group) {
  return group.workflow_state.status !== "none" && (group.workflow_state.status !== "completed" || group.need_user_acknowledgement === true) && !isBeingArchived(group.workflow_state.status);
}

onMounted(() => {
  initialLoad();
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
        <div v-show="exceptionGroups.length > 0">
          <div class="row box box-group wf-{{group.workflow_state.status}} repeat-modify" v-for="(group, index) in exceptionGroups" :key="index" v-show="exceptionGroups.length > 0" :disabled="group.count == 0" @mouseenter="group.hover2 = true" @mouseleave="group.hover2 = false">
            <div class="col-sm-12 no-mobile-side-padding">
              <div class="row">
                <div class="col-sm-12 no-side-padding">
                  <div class="row box-header">
                    <div class="col-sm-12 no-side-padding">
                      <p class="lead break" v-bind:class="{ 'msg-type-hover': group.hover2, 'msg-type-hover-off': group.hover3 }">
                        {{ group.title }}
                      </p>
                      <p class="metadata" v-show="!isBeingRetried(group) && !isBeingArchived(group.workflow_state.status)">
                        <span class="metadata">
                          <i aria-hidden="true" class="fa fa-envelope"></i>
                          {{ group.count }} message<span v-show="group.count > 1">s</span>
                          <span v-show="group.operation_remaining_count > 0"> (currently retrying {{ group.operation_remaining_count }} </span>
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
                          <time-since :date-utc="group.last_operation_completion_time"></time-since>
                        </span>
                      </p>
                    </div>
                  </div>

                  <div class="row" v-show="!isBeingRetried(group) && !isBeingArchived(group.workflow_state.status)">
                    <div class="col-sm-12 no-side-padding">
                      <div class="note" v-show="group.comment">
                        <span> <strong>NOTE:</strong> {{ group.comment }} </span>
                      </div>
                    </div>
                  </div>
                  <div class="row" v-show="!isBeingRetried(group) && !isBeingArchived(group.workflow_state.status)">
                    <div class="col-sm-12 no-side-padding">
                      <button type="button" class="btn btn-link btn-sm" :disabled="group.count == 0 || isBeingRetried(group)" @mouseenter="group.hover3 = true" @mouseleave="group.hover3 = false" v-if="exceptionGroups.length > 0" @click="retryGroup(group)"><i aria-hidden="true" class="fa fa-repeat no-link-underline">&nbsp;</i>Request retry</button>

                      <button type="button" class="btn btn-link btn-sm" :disabled="group.count == 0 || isBeingRetried(group)" @mouseenter="group.hover3 = true" @mouseleave="group.hover3 = false" v-if="exceptionGroups.length > 0" @click="deleteGroup(group)"><i aria-hidden="true" class="fa fa-trash no-link-underline">&nbsp;</i>Delete group</button>
                      <button type="button" class="btn btn-link btn-sm" v-if="!group.comment" @click="editNote(group)"><i aria-hidden="true" class="fa fa-sticky-note no-link-underline">&nbsp;</i>Add note</button>
                      <button type="button" class="btn btn-link btn-sm" v-if="group.comment" @click="editNote(group)"><i aria-hidden="true" class="fa fa-pencil no-link-underline">&nbsp;</i>Edit note</button>
                      <button type="button" class="btn btn-link btn-sm" v-if="group.comment" @click="deleteNote(group)"><i aria-hidden="true" class="fa fa-eraser no-link-underline">&nbsp;</i>Remove note</button>
                    </div>
                  </div>

                  <!--isBeingRetried-->
                  <div class="row" v-show="isBeingRetried(group)">
                    <div class="col-sm-12 no-side-padding">
                      <div class="panel panel-default panel-retry">
                        <div class="panel-body">
                          <ul class="retry-request-progress">
                            <li v-hide="group.workflow_state.status === 'completed'" v-bind:class="getClassesForRetryOperation('waiting', group.workflow_state.status)">
                              <div class="bulk-retry-progress-status">Initialize retry request...</div>
                            </li>
                            <li v-hide="group.workflow_state.status === 'completed'" v-bind:class="getClassesForRetryOperation('preparing', group.workflow_state.status)">
                              <div class="row">
                                <div class="col-xs-12 col-sm-4 col-md-3 no-side-padding">
                                  <div class="bulk-retry-progress-status">Prepare messages...</div>
                                </div>

                                <div class="col-xs-12 col-sm-6">
                                  <div class="progress bulk-retry-progress" v-show="group.workflow_state.status === 'preparing'">
                                    <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="{{group.workflow_state.total}}" aria-valuemin="0" aria-valuemax="100" :style="{ 'min-width': '2em', width: group.workflow_state.total + '%' }">{{ group.workflow_state.total }}%</div>
                                  </div>
                                </div>
                              </div>
                            </li>
                            <li v-hide="group.workflow_state.status === 'completed'" v-bind:class="getClassesForRetryOperation('forwarding', group.workflow_state.status)">
                              <div class="row">
                                <div class="col-xs-9 col-sm-4 col-md-3 no-side-padding">
                                  <div class="bulk-retry-progress-status">Send messages to retry...</div>
                                </div>
                                <div class="col-xs-3 col-sm-3 retry-op-queued" v-show="group.workflow_state.status === 'queued'">(Queued)</div>
                                <div class="col-xs-12 col-sm-6">
                                  <div class="progress bulk-retry-progress" v-show="group.workflow_state.status === 'forwarding'">
                                    <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="{{group.workflow_state.total}}" aria-valuemin="0" aria-valuemax="100" :style="{ 'min-width': '2em', width: group.workflow_state.total + '%' }">{{ group.workflow_state.total }}%</div>
                                  </div>
                                </div>
                              </div>
                            </li>
                            <li v-show="group.workflow_state.status === 'completed'">
                              <div class="retry-completed bulk-retry-progress-status">Retry request completed</div>
                              <button type="button" class="btn btn-default btn-primary btn-xs btn-retry-dismiss" v-show="group.need_user_acknowledgement == true" @click="acknowledgeGroup(group)">Dismiss</button>
                              <div class="danger sc-restart-warning" v-show="group.workflow_state.failed"><i aria-hidden="true" class="fa fa-exclamation-triangle danger"></i> <strong>WARNING: </strong>Not all messages will be retried because ServiceControl had to restart. You need to request retrying the remaining messages.</div>
                            </li>
                          </ul>

                          <div class="op-metadata">
                            <span class="metadata"><i aria-hidden="true" class="fa fa-envelope"></i> {{ group.workflow_state.status === "completed" ? "Messages sent:" : "Messages to send:" }} {{ group.operation_remaining_count || group.count }}</span>
                            <span class="metadata"><i aria-hidden="true" class="fa fa-clock-o"></i> Retry request started: <time-since :date-utc="group.operation_start_time"></time-since></span>
                            <span class="metadata" v-show="group.workflow_state.status === 'completed'"><i aria-hidden="true" class="fa fa-clock-o"></i> Retry request completed: <time-since :date-utc="group.operation_completion_time"></time-since></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!--isBeingArchived-->
                  <div class="row" v-show="isBeingArchived(group.workflow_state.status)">
                    <div class="col-sm-12 no-side-padding">
                      <div class="panel panel-default panel-retry">
                        <div class="panel-body">
                          <ul class="retry-request-progress">
                            <li v-hide="group.workflow_state.status === 'archivecompleted'" v-bind:class="getClassesForArchiveOperation('archivestarted', group.workflow_state.status)">
                              <div class="bulk-retry-progress-status">Initialize delete request...</div>
                            </li>
                            <li v-hide="group.workflow_state.status === 'archivecompleted'" v-bind:class="getClassesForArchiveOperation('archiveprogressing', group.workflow_state.status)">
                              <div class="row">
                                <div class="col-xs-12 col-sm-4 col-md-3 no-side-padding">
                                  <div class="bulk-retry-progress-status">Delete request in progress...</div>
                                </div>
                                <div class="col-xs-12 col-sm-6">
                                  <div class="progress bulk-retry-progress" v-show="group.workflow_state.status === 'archiveprogressing'">
                                    <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="{{group.workflow_state.total}}" aria-valuemin="0" aria-valuemax="100" :style="{ 'min-width': '2em', width: group.workflow_state.total + '%' }">{{ group.workflow_state.total }} %</div>
                                  </div>
                                </div>
                              </div>
                            </li>
                            <li v-hide="group.workflow_state.status === 'archivecompleted'" v-bind:class="getClassesForArchiveOperation('archivefinalizing', group.workflow_state.status)">
                              <div class="row">
                                <div class="col-xs-12 col-sm-4 col-md-3 no-side-padding">
                                  <div class="bulk-retry-progress-status">Cleaning up...</div>
                                </div>
                              </div>
                            </li>
                            <li v-show="group.workflow_state.status === 'archivecompleted'">
                              <div class="retry-completed bulk-retry-progress-status">Delete request completed</div>
                              <button type="button" class="btn btn-default btn-primary btn-xs btn-retry-dismiss" v-show="group.need_user_acknowledgement == true" @click="acknowledgeGroup(group)">Dismiss</button>
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
  <!--modal display - delete comment note-->
  <Teleport to="#modalDisplay">
    <FailedMessageGroupNoteDelete v-if="showDeleteNoteModal === true" v-bind="selectedGroup" :group_id="selectedGroup.groupid" @cancelDeleteNote="showDeleteNoteModal = false" @deleteNoteConfirmed="saveDeleteNote"></FailedMessageGroupNoteDelete>
  </Teleport>

  <!--modal display - create new/edit comment note-->
  <Teleport to="#modalDisplay">
    <FailedMessageGroupNoteEdit v-if="showEditNoteModal === true" v-bind="selectedGroup" :group_id="selectedGroup.groupid" @cancelEditNote="showEditNoteModal = false" @createNoteConfirmed="saveCreatedNote" @editNoteConfirmed="saveEditedNote"></FailedMessageGroupNoteEdit>
  </Teleport>

  <!--modal display - delete group-->
  <Teleport to="#modalDisplay">
    <FailedMessageGroupDelete v-if="showDeleteGroupModal === true" v-bind="selectedGroup" :group_id="selectedGroup.groupid" @cancelDeleteGroup="showDeleteGroupModal = false" @deleteGroupConfirmed="saveDeleteGroup"></FailedMessageGroupDelete>
  </Teleport>

  <!--modal display - retry group-->
  <Teleport to="#modalDisplay">
    <FailedMessageGroupRetry v-if="showRetryGroupModal === true" v-bind="selectedGroup" :group_id="selectedGroup.groupid" @cancelRetryGroup="showRetryGroupModal = false" @retryGroupConfirmed="saveRetryGroup"></FailedMessageGroupRetry>
  </Teleport>
</template>

<style>
.fake-link i {
  padding-right: 0.2em;
}

.messagegrouplist {
  padding-bottom: 2em;
}
</style>
