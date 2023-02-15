<script setup>
import { ref, onMounted } from "vue";
import NoData from "../NoData.vue";
import TimeSince from "../TimeSince.vue";

import FailedMessageGroupNoteDelete from "./FailedMessageGroupNoteDelete.vue";
import FailedMessageGroupNoteEdit from "./FailedMessageGroupNoteEdit.vue";
import { useShowToast } from "../../composables/toast.js";
import {
  useDeleteNote,
  useEditOrCreateNote,
  useGetExceptionGroups,
} from "../../composables/serviceMessageGroup.js";
const exceptionGroups = ref([]);

const loadingData = ref(true);
const initialLoadComplete = ref(false);
const emit = defineEmits(["InitialLoadComplete", "ExceptionGroupCountUpdated"]);

const showDeleteNoteModal = ref(false);
const showEditNoteModal = ref(false);
const selectedGroup = ref({
  groupid: "",
  comment: "",
});
const noteSaveSuccessful = ref(null);

function getExceptionGroups() {
  exceptionGroups.value = [];
  return useGetExceptionGroups().then((result) => {
    exceptionGroups.value = result;
  });
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
        alert("from grouplist vue");
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

function saveCreatedNote(group) {
  noteSaveSuccessful.value = null;
  showEditNoteModal.value = false;
  useEditOrCreateNote(group.groupid, group.comment).then((result) => {
    if (result.message === "success") {
      noteSaveSuccessful.value = true;
      useShowToast("info", "Info", "Note created successfully");
      getExceptionGroups(); //reload the groups
    } else {
      noteSaveSuccessful.value = false;
      useShowToast(
        "error",
        "Error",
        "Failed to create a Note:" + result.message
      );
    }
  });
}

//edit comment note
function editNote(group) {
  noteSaveSuccessful.value = null;
  selectedGroup.value.groupid = group.id;
  selectedGroup.value.comment = group.comment;
  showEditNoteModal.value = true;
}
function saveEditedNote(group) {
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
          <button
            type="button"
            class="btn btn-default dropdown-toggle sp-btn-menu"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            vm.selectedClassification
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu">
            <li ng-repeat="classifier in vm.availableClassifiers">
              <a href="#/failed-messages/groups?groupBy={{classifier}}"
                >classifier</a
              >
            </li>
          </ul>
        </div>

        <div class="msg-group-menu dropdown">
          <label class="control-label">Sort by:</label>
          <button
            type="button"
            class="btn btn-default dropdown-toggle sp-btn-menu"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            vm.selectedSort
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu" ng-for="sort in sortSelectors">
            <li>
              <a href="#/failed-messages/groups?sortBy={{sort.description}}"
                >sort.description</a
              >
            </li>
            <li ng-repeat-end>
              <a
                href="#/failed-messages/groups?sortBy={{sort.description}}&sortdir=desc"
                >sort.description <span>(Descending)</span></a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-sm-12">
        <busy v-show="loadingData" message="fetching more messages"></busy>
        <no-data
          v-if="exceptionGroups.length === 0 && !loadingData"
          title="message groups"
          message="There are currently no grouped message failures"
        ></no-data>
      </div>
    </div>

    <div class="row">
      <div class="col-sm-12 no-mobile-side-padding">
        <div v-show="exceptionGroups.length > 0">
          <div
            class="row box box-group wf-{{group.workflow_state.status}} repeat-modify"
            v-for="(group, index) in exceptionGroups"
            :key="index"
            v-show="exceptionGroups.length > 0"
            ng-click="vm.viewExceptionGroup(group)"
            ng-disabled="group.count == 0"
            ng-mouseenter="group.hover2 = true"
            ng-mouseleave="group.hover2 = false"
          >
            <div class="col-sm-12 no-mobile-side-padding">
              <div class="row">
                <div class="col-sm-12 no-side-padding">
                  <div class="row box-header">
                    <div class="col-sm-12 no-side-padding">
                      <p
                        class="lead break"
                        ng-class="{'msg-type-hover': group.hover2, 'msg-type-hover-off': group.hover3}"
                      >
                        {{ group.title }}
                      </p>
                      <p
                        class="metadata"
                        ng-show="!isBeingRetried(group) && !isBeingArchived(group.workflow_state.status)"
                      >
                        <span class="metadata">
                          <i aria-hidden="true" class="fa fa-envelope"></i>
                          {{ group.count }} message<span
                            v-show="group.count > 1"
                            >s</span
                          >
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
                          <time-since
                            :date-utc="group.last_operation_completion_time"
                          ></time-since>
                        </span>
                      </p>
                    </div>
                  </div>
                  <div
                    class="row"
                    ng-show="!isBeingRetried(group) && !isBeingArchived(group.workflow_state.status)"
                  >
                    <div class="col-sm-12 no-side-padding">
                      <div class="note" v-show="group.comment">
                        <span>
                          <strong>NOTE:</strong> {{ group.comment }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    class="row"
                    ng-show="!vm.isBeingRetried(group) && !vm.isBeingArchived(group.workflow_state.status)"
                  >
                    <div class="col-sm-12 no-side-padding">
                      <button
                        type="button"
                        class="btn btn-link btn-sm"
                        confirm-click="vm.retryExceptionGroup(group, $event)"
                        ng-disabled="group.count == 0 || vm.isBeingRetried(group)"
                        ng-mouseenter="group.hover3 = true"
                        ng-mouseleave="group.hover3 = false"
                        confirm-title="Are you sure you want to retry this group?"
                        confirm-message="Retrying a whole group can take some time and put extra load on your system. Are you sure you want to retry this group of {{group.count}} messages?"
                      >
                        <i
                          aria-hidden="true"
                          class="fa fa-repeat no-link-underline"
                          >&nbsp;</i
                        >Request retry
                      </button>
                      <button
                        type="button"
                        class="btn btn-link btn-sm"
                        confirm-click="vm.archiveExceptionGroup(group, $event)"
                        ng-disabled="group.count == 0 || vm.isBeingRetried(group)"
                        ng-mouseenter="group.hover3 = true"
                        ng-mouseleave="group.hover3 = false"
                        confirm-title="Are you sure you want to delete this group?"
                        confirm-message="Messages that are deleted will be cleaned up according to the ServiceControl retention policy, and aren't available for retrying unless they're restored."
                      >
                        <i
                          aria-hidden="true"
                          class="fa fa-trash no-link-underline"
                          >&nbsp;</i
                        >Delete group
                      </button>
                      <button
                        type="button"
                        class="btn btn-link btn-sm"
                        v-if="!group.comment"
                        @click="editNote(group)"
                      >
                        <i
                          aria-hidden="true"
                          class="fa fa-sticky-note no-link-underline"
                          >&nbsp;</i
                        >Add note
                      </button>
                      <button
                        type="button"
                        class="btn btn-link btn-sm"
                        v-if="group.comment"
                        @click="editNote(group)"
                      >
                        <i
                          aria-hidden="true"
                          class="fa fa-pencil no-link-underline"
                          >&nbsp;</i
                        >Edit note
                      </button>
                      <button
                        type="button"
                        class="btn btn-link btn-sm"
                        v-if="group.comment"
                        @click="deleteNote(group)"
                      >
                        <i
                          aria-hidden="true"
                          class="fa fa-eraser no-link-underline"
                          >&nbsp;</i
                        >Remove note
                      </button>
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

  <Teleport to="#modalDisplay">
    <FailedMessageGroupNoteDelete
      v-if="showDeleteNoteModal === true"
      v-bind="selectedGroup"
      :group_id="selectedGroup.groupid"
      @cancelDeleteNote="showDeleteNoteModal = false"
      @deleteNoteConfirmed="saveDeleteNote"
    ></FailedMessageGroupNoteDelete>
  </Teleport>
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
</template>

<style>
.fake-link i {
  padding-right: 0.2em;
}

.messagegrouplist {
  padding-bottom: 2em;
}
</style>
