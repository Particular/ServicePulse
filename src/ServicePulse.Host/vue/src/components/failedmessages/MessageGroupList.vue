<script setup>
import { ref, onMounted } from "vue";
import NoData from "../NoData.vue";
import TimeSince from "../TimeSince.vue";
import { stats } from "../../composables/serviceServiceControl";
import { useFetchFromServiceControl } from "../../composables/serviceServiceControlUrls";
    import FailedMessageGroupNoteDelete from "./FailedMessageGroupNoteDelete.vue";
    import FailedMessageGroupNoteEdit from "./FailedMessageGroupNoteEdit.vue";
    import { useShowToast } from "../../composables/toast.js";
import {
        useDeleteNote, useEditOrCreateNote
    } from "../../composables/serviceGroupNote.js";
const exceptionGroups = ref([]);
// const sortSelectors  = ref([]);
//  const stats ;
//const isBeingRetried = ref(false);
//const isBeingArchived = ref(false);
const loadingData = ref(true);
const initialLoadComplete = ref(false);
const emit = defineEmits(["InitialLoadComplete","ExceptionGroupCountUpdated"]);
const sortSelectors = [{
        description: 'Name',
        selector: function (group) { return group.title; }
    }, {
        description: 'Number of messages',
        selector: function (group) { return group.count; }
    }, {
        description: 'First Failed Time',
        selector: function (group) { return group.first; }
    }, {
        description: 'Last Failed Time',
        selector: function (group) { return group.last; }
    }, {
        description: 'Last Retried Time',
        selector: function (group) { return group.last_operation_completion_time; }
    }];
const showDelete = ref(false);
const showEdit = ref(false);
    const selectedNote = ref({
       groupid:"",
        comment: "",
    });
const noteSaveSuccessful = ref(null);
    //isBeingRetried = function (group) {
    //    return group.workflow_state.status !== 'none' && (group.workflow_state.status !== 'completed' || group.need_user_acknowledgement === true) && !vm.isBeingArchived(group.workflow_state.status);
    //};

    //isBeingArchived = function (status) {
    //    return status === "archivestarted" || status === "archiveprogressing" || status === "archivefinalizing" || status === "archivecompleted";
    //};
function getExceptionGroups() {
  exceptionGroups.value = [];
  // return serviceControlService.getExceptionGroups(vm.selectedClassification)
  return useFetchFromServiceControl("recoverability/groups")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      exceptionGroups.value = [];
      exceptionGroups.value = data;
    });
  if (response.status === 304 && exceptionGroups.length > 0) {
      return true;
  }
  if (response.data.length > 0) {

      // need a map in some ui state for controlling animations
      exceptionGroups = response.data.map(initializeGroupState);
      //exceptionGroups.sort(getSort());

      if (exceptionGroups.length !== stats.number_of_exception_groups) {
          stats.number_of_exception_groups = exceptionGroups.length;
          emit('ExceptionGroupCountUpdated', stats.number_of_exception_groups);
      }
    //  exceptionGroups.value = [];
    //  exceptionGroups.value = data;
  }
  return true;
}

//    function getSort() {
//    var sortBy = sortSelectors[0].description;
//    var sortDir = 'asc';

//    if ($routeParams.sortBy) {
//        sortBy = $routeParams.sortBy;
//        sortDir = ($routeParams.sortdir || 'asc').toLowerCase();

//        saveSort($routeParams.sortBy, sortDir);
//    } else if ($cookies.get('sortCriteria')) {
//        sortBy = $cookies.get('sortCriteria');
//        sortDir = ($cookies.get('sortDirection') || 'asc').toLowerCase();
//    }

//    var propertySelector = vm.sortSelectors.find(function (selector) { return selector.description.toLowerCase() === sortBy.toLowerCase(); }).selector;
//    return comparers[sortDir](propertySelector);
//};

//function saveSort (sortCriteria, sortDirection) {
//    $cookies.put('sortCriteria', sortCriteria);
//    $cookies.put('sortDirection', sortDirection);

//    vm.selectedSort = getDefaultSortSelection();
//};

//function getDefaultSortSelection () {
//    var sortBy = sortSelectors[0].description;
//    var sortDir = '';

//    if ($cookies.get('sortCriteria')) {
//        sortBy = $cookies.get('sortCriteria');
//        sortDir = ($cookies.get('sortDirection') || 'asc').toLowerCase();

//        if (sortDir === 'asc') {
//            sortDir = '';
//        } else {
//            sortDir = ' (Desc)'
//        }
//    }

//    return sortSelectors.find(function (selector) { return selector.description.toLowerCase() === sortBy.toLowerCase(); }).description + sortDir;
//};
    function initializeGroupState(group) {
        var operationStatus = (group.operation_status ? group.operation_status.toLowerCase() : null) ||
            'none';
        if (operationStatus === 'preparing' && group.operation_progress === 1) {
            operationStatus = 'queued';
        }
        group.workflow_state = createWorkflowState(operationStatus, group.operation_progress, group.operation_failed);
        return group;
    };




function initialLoad() {
  loadingData.value = true;
  initialLoadComplete.value = false;

  getExceptionGroups().then(function () {
    loadingData.value = false;
    initialLoadComplete.value = true;
    emit("InitialLoadComplete");
    return true;
  });

}
    //delete comment note
    function deleteNote(group) {
        noteSaveSuccessful.value = null;
        selectedNote.value.groupid = group.id,
        showDelete.value = true;
    }
    function saveDeleteNote(groupId) {
        showDelete.value = false;
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
    function createNote(group) {
        noteSaveSuccessful.value = null;
        selectedNote.value.groupid = group.id;
        selectedNote.value.comment = "";
        showEdit.value = true;
    }
    function saveCreatedNote(group) {
        noteSaveSuccessful.value = null;
        showEdit.value = false;
        useEditOrCreateNote(group.groupid,group.comment).then((result) => {
                if (result.message === "success") {
                    noteSaveSuccessful.value = true;
                    useShowToast("info", "Info", "Note created successfully");
                    getExceptionGroups(); //reload the groups
                } else {
                    noteSaveSuccessful.value = false;
                    useShowToast("error", "Error", "Failed to create a Note:" + result.message);
                }
        });
    }

    //edit comment note
    function editNote(group) {
        noteSaveSuccessful.value = null;
        selectedNote.value.groupid = group.id;
        selectedNote.value.comment = group.comment;
        showEdit.value = true;
    }
    function saveEditedNote(group) {
        noteSaveSuccessful.value = null;
        showEdit.value = false;
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



onMounted(() => {
  initialLoad();
});
</script>
<template>
    <div class="messagegrouplist">
        <div class="row">
            <div class="col-sm-12 toolbar-menus no-side-padding">
                <div class="msg-group-menu dropdown">
                    <label class="control-label">Group by:</label>
                    <button type="button"
                            class="btn btn-default dropdown-toggle sp-btn-menu"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false">
                        vm.selectedClassification
                        <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu">
                        <li ng-repeat="classifier in vm.availableClassifiers">
                            <a href="#/failed-messages/groups?groupBy={{classifier}}">classifier</a>
                        </li>
                    </ul>
                </div>

                <div class="msg-group-menu dropdown">
                    <label class="control-label">Sort by:</label>
                    <button type="button"
                            class="btn btn-default dropdown-toggle sp-btn-menu"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false">
                        vm.selectedSort
                        <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu" v-for="sort in sortSelectors">
                        <li>
                            <a href="#/failed-messages/groups?sortBy={{sort.description}}">sort.description</a>
                        </li>
                        <li ng-repeat-end>
                            <a href="#/failed-messages/groups?sortBy={{sort.description}}&sortdir=desc">sort.description <span>(Descending)</span></a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-sm-12">
                <busy v-show="loadingData" message="fetching more messages"></busy>
                <no-data v-if="exceptionGroups.length === 0 && !loadingData"
                         title="message groups"
                         message="There are currently no grouped message failures"></no-data>
            </div>
        </div>

        <div class="row">
            <div class="col-sm-12 no-mobile-side-padding">
                <div v-show="exceptionGroups.length > 0">
                    <div class="row box box-group wf-{{group.workflow_state.status}} repeat-modify"
                         v-for="(group, index) in exceptionGroups"
                         :key="index"
                         v-show="exceptionGroups.length"
                         ng-click="vm.viewExceptionGroup(group)"
                         ng-disabled="group.count == 0"
                         ng-mouseenter="group.hover2 = true"
                         ng-mouseleave="group.hover2 = false">
                        <div class="col-sm-12 no-mobile-side-padding">
                            <div class="row">
                                <div class="col-sm-12 no-side-padding">
                                    <div class="row box-header">
                                        <div class="col-sm-12 no-side-padding">
                                            <p class="lead break"
                                               ng-class="{'msg-type-hover': group.hover2, 'msg-type-hover-off': group.hover3}">
                                                {{ group.title }}
                                            </p>
                                            <p class="metadata"
                                               ng-show="!isBeingRetried(group) && !isBeingArchived(group.workflow_state.status)">
                                                <span class="metadata">
                                                    <i aria-hidden="true" class="fa fa-envelope"></i>
                                                    {{ group.count }} message<span v-show="group.count > 1">s</span>
                                                    <span v-show="group.operation_remaining_count > 0">
                                                        (currently retrying group.operation_remaining_count
                                                        | number)
                                                    </span>
                                                </span>

                                                <span class="metadata">
                                                    <i aria-hidden="true" class="fa fa-clock-o"></i>
                                                    First failed:
                                                    <time-since :date-utc="group.first"></time-since>
                                                </span>

                                                <span class="metadata">
                                                    <i aria-hidden="true" class="fa fa-clock-o"></i> Last
                                                    failed:
                                                    <time-since :date-utc="group.last"></time-since>
                                                </span>

                                                <span class="metadata">
                                                    <i aria-hidden="true" class="fa fa-repeat"></i> Last
                                                    retried:
                                                    <time-since :date-utc="group.last_operation_completion_time"></time-since>
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div class="row"
                                         ng-show="!isBeingRetried(group) && !isBeingArchived(group.workflow_state.status)">
                                        <div class="col-sm-12 no-side-padding">
                                            <div class="note" v-show="group.comment">
                                                <span>
                                                    <strong>NOTE:</strong> {{ group.comment }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row"
                                         ng-show="!vm.isBeingRetried(group) && !vm.isBeingArchived(group.workflow_state.status)">
                                        <div class="col-sm-12 no-side-padding">
                                            <button type="button"
                                                    class="btn btn-link btn-sm"
                                                    confirm-click="vm.retryExceptionGroup(group, $event)"
                                                    ng-disabled="group.count == 0 || vm.isBeingRetried(group)"
                                                    ng-mouseenter="group.hover3 = true"
                                                    ng-mouseleave="group.hover3 = false"
                                                    confirm-title="Are you sure you want to retry this group?"
                                                    confirm-message="Retrying a whole group can take some time and put extra load on your system. Are you sure you want to retry this group of {{group.count}} messages?">
                                                <i aria-hidden="true"
                                                   class="fa fa-repeat no-link-underline">&nbsp;</i>Request retry
                                            </button>
                                            <button type="button"
                                                    class="btn btn-link btn-sm"
                                                    confirm-click="vm.archiveExceptionGroup(group, $event)"
                                                    ng-disabled="group.count == 0 || vm.isBeingRetried(group)"
                                                    ng-mouseenter="group.hover3 = true"
                                                    ng-mouseleave="group.hover3 = false"
                                                    confirm-title="Are you sure you want to delete this group?"
                                                    confirm-message="Messages that are deleted will be cleaned up according to the ServiceControl retention policy, and aren't available for retrying unless they're restored.">
                                                <i aria-hidden="true"
                                                   class="fa fa-trash no-link-underline">&nbsp;</i>Delete group
                                            </button>
                                            <button type="button"
                                                    class="btn btn-link btn-sm"
                                                    v-if="!group.comment"
                                                    @click="editNote(group)">
                                                <i aria-hidden="true"
                                                   class="fa fa-sticky-note no-link-underline">&nbsp;</i>Add note
                                            </button>
                                            <button type="button"
                                                    class="btn btn-link btn-sm"
                                                    v-if="group.comment"
                                                    @click="editNote(group)">
                                                <i aria-hidden="true"
                                                   class="fa fa-pencil no-link-underline">&nbsp;</i>Edit note
                                            </button>
                                            <button type="button"
                                                    class="btn btn-link btn-sm"
                                                    v-if="group.comment"
                                                    @click="deleteNote(group)">
                                                <i aria-hidden="true"
                                                   class="fa fa-eraser no-link-underline">&nbsp;</i>Remove note
                                            </button>
                                        </div>
                                    </div>

                                    <!--isBeingRetried-->
                                    <!--
                                                      <div class="row" ng-show="vm.isBeingRetried(group)">
                                                          <div class="col-sm-12 no-side-padding">
                                                              <div class="panel panel-default panel-retry">
                                                                  <div class="panel-body">
                                                                      <ul class="retry-request-progress">
                                                                          <li ng-hide="group.workflow_state.status === 'completed'" ng-class="vm.getClassesForRetryOperation('waiting', group.workflow_state.status)">
                                                                              <div class="bulk-retry-progress-status">Initialize retry request...</div>
                                                                          </li>
                                                                          <li ng-hide="group.workflow_state.status === 'completed'" ng-class="vm.getClassesForRetryOperation('preparing', group.workflow_state.status)">

                                                                              <div class="row">
                                                                                  <div class="col-xs-12 col-sm-4 col-md-3 no-side-padding">
                                                                                      <div class="bulk-retry-progress-status">Prepare messages...</div>
                                                                                  </div>

                                                                                  <div class="col-xs-12 col-sm-6">
                                                                                      <div class="progress bulk-retry-progress" ng-show="group.workflow_state.status === 'preparing'">
                                                                                          <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="{{group.workflow_state.total}}" aria-valuemin="0" aria-valuemax="100" ng-style="{'min-width': '2em', 'width': group.workflow_state.total + '%'}">
                                                                                              ##group.workflow_state.total | number : 0##%
                                                                                          </div>
                                                                                      </div>
                                                                                  </div>
                                                                              </div>
                                                                          </li>
                                                                          <li ng-hide="group.workflow_state.status === 'completed'" ng-class="vm.getClassesForRetryOperation('forwarding', group.workflow_state.status)">

                                                                              <div class="row">
                                                                                  <div class="col-xs-9 col-sm-4 col-md-3 no-side-padding">
                                                                                      <div class="bulk-retry-progress-status">Send messages to retry...</div>
                                                                                  </div>
                                                                                  <div class="col-xs-3 col-sm-3 retry-op-queued" ng-show="group.workflow_state.status === 'queued'">
                                                                                      (Queued)
                                                                                  </div>
                                                                                  <div class="col-xs-12 col-sm-6">

                                                                                      <div class="progress bulk-retry-progress" ng-show="group.workflow_state.status === 'forwarding'">
                                                                                          <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="{{group.workflow_state.total}}" aria-valuemin="0" aria-valuemax="100" ng-style="{'min-width': '2em', 'width': group.workflow_state.total + '%'}">
                                                                                              ##group.workflow_state.total | number : 0#%
                                                                                          </div>
                                                                                      </div>
                                                                                  </div>
                                                                              </div>
                                                                          </li>
                                                                          <li ng-show="group.workflow_state.status === 'completed'">
                                                                              <div class="retry-completed bulk-retry-progress-status">Retry request completed</div>
                                                                              <button type="button" class="btn btn-default btn-primary btn-xs btn-retry-dismiss" ng-show="group.need_user_acknowledgement == true" ng-click="vm.acknowledgeGroup(group, $event)">
                                                                                  Dismiss
                                                                              </button>
                                                                              <div class="danger sc-restart-warning" ng-show="{{group.workflow_state.failed}}">
                                                                                  <i aria-hidden="true" class="fa fa-exclamation-triangle danger"></i> <strong>WARNING: </strong>Not all messages will be retried because ServiceControl had to restart. You need to request retrying the remaining messages.
                                                                              </div>
                                                                          </li>
                                                                      </ul>

                                                                      <div class="op-metadata">
                                                                          <span class="metadata"><i aria-hidden="true" class="fa fa-envelope"></i> group.workflow_state.status === 'completed' ? 'Messages sent:' : 'Messages to send:' (group.operation_remaining_count || group.count) | number</span>
                                                                          <span class="metadata"><i aria-hidden="true" class="fa fa-clock-o"></i> Retry request started: <sp-moment date="{{group.operation_start_time}}"></sp-moment></span>
                                                                          <span class="metadata" ng-show="group.workflow_state.status === 'completed'"><i aria-hidden="true" class="fa fa-clock-o"></i> Retry request completed: <sp-moment date="{{group.operation_completion_time}}"></sp-moment></span>
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                          </div>
                                                      </div>
                                                     -->
                                    <!--isBeingArchived-->
                                    <!--
                                                      <div class="row" ng-show="vm.isBeingArchived(group.workflow_state.status)">
                                                          <div class="col-sm-12 no-side-padding">
                                                              <div class="panel panel-default panel-retry">
                                                                  <div class="panel-body">
                                                                      <ul class="retry-request-progress">
                                                                          <li ng-hide="group.workflow_state.status === 'archivecompleted'" ng-class="vm.getClassesForArchiveOperation('archivestarted', group.workflow_state.status)">
                                                                              <div class="bulk-retry-progress-status">Initialize delete request...</div>
                                                                          </li>
                                                                          <li ng-hide="group.workflow_state.status === 'archivecompleted'" ng-class="vm.getClassesForArchiveOperation('archiveprogressing', group.workflow_state.status)">
                                                                              <div class="row">
                                                                                  <div class="col-xs-12 col-sm-4 col-md-3 no-side-padding">
                                                                                      <div class="bulk-retry-progress-status">Delete request in progress...</div>
                                                                                  </div>

                                                                                  <div class="col-xs-12 col-sm-6">
                                                                                      <div class="progress bulk-retry-progress" ng-show="group.workflow_state.status === 'archiveprogressing'">
                                                                                          <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="{{group.workflow_state.total}}" aria-valuemin="0" aria-valuemax="100" ng-style="{'min-width': '2em', 'width': group.workflow_state.total + '%'}">
                                                                                              group.workflow_state.total | number : 0%
                                                                                          </div>
                                                                                      </div>
                                                                                  </div>
                                                                              </div>
                                                                          </li>
                                                                          <li ng-hide="group.workflow_state.status === 'archivecompleted'" ng-class="vm.getClassesForArchiveOperation('archivefinalizing', group.workflow_state.status)">
                                                                              <div class="row">
                                                                                  <div class="col-xs-12 col-sm-4 col-md-3 no-side-padding">
                                                                                      <div class="bulk-retry-progress-status">Cleaning up...</div>
                                                                                  </div>
                                                                              </div>
                                                                          </li>
                                                                          <li ng-show="group.workflow_state.status === 'archivecompleted'">
                                                                              <div class="retry-completed bulk-retry-progress-status">Delete request completed</div>
                                                                              <button type="button" class="btn btn-default btn-primary btn-xs btn-retry-dismiss" ng-show="group.need_user_acknowledgement == true" ng-click="vm.acknowledgeArchiveGroup(group, $event)">
                                                                                  Dismiss
                                                                              </button>
                                                                          </li>
                                                                      </ul>

                                                                      <div class="op-metadata">
                                                                          <span class="metadata"><i aria-hidden="true" class="fa fa-clock-o"></i> Delete request started: <sp-moment date="{{group.operation_start_time}}"></sp-moment></span>
                                                                          <span class="metadata"><i aria-hidden="true" class="fa fa-envelope"></i> Messages left to delete: (group.operation_remaining_count || 0) | number</span>
                                                                          <span class="metadata"><i aria-hidden="true" class="fa fa-envelope"></i> Messages deleted: (group.operation_messages_completed_count || 0) | number</span>
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                          </div>
                                                      </div>
                                                      -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Teleport to="#modalDisplay">
        <FailedMessageGroupNoteDelete v-if="showDelete === true"
                                      :group_id="selectedNote.groupid"
                                      @cancel="showDelete = false"
                                      @delete="saveDeleteNote"></FailedMessageGroupNoteDelete>
    </Teleport>
    <Teleport to="#modalDisplay">
        <FailedMessageGroupNoteEdit v-if="showEdit === true" v-bind="selectedNote"
                                      :group_id="selectedNote.groupid"
                                      @cancel="showEdit = false"
                                      @create="saveCreatedNote"
                                      @edit="saveEditedNote"></FailedMessageGroupNoteEdit>
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
