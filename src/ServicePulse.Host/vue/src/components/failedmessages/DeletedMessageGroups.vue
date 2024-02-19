<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { licenseStatus } from "../../composables/serviceLicense";
import { connectionState, stats } from "../../composables/serviceServiceControl";
import { useShowToast } from "../../composables/toast";
import { useGetArchiveGroups, useRestoreGroup } from "../../composables/serviceMessageGroup";
import { useFetchFromServiceControl } from "../../composables/serviceServiceControlUrls";
import { useCookies } from "vue3-cookies";
import NoData from "../NoData.vue";
import TimeSince from "../TimeSince.vue";
import LicenseExpired from "../../components/LicenseExpired.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import ConfirmDialog from "../ConfirmDialog.vue";
import routeLinks from "@/router/routeLinks";

let pollingFaster = false;
const messageGroupList = ref();
const archiveGroups = ref([]);
const undismissedRestoreGroups = ref([]);
const loadingData = ref(true);
const initialLoadComplete = ref(false);
const emit = defineEmits(["InitialLoadComplete", "ExceptionGroupCountUpdated"]);
let refreshInterval = undefined;
const route = useRoute();
const router = useRouter();
const showRestoreGroupModal = ref(false);
const selectedGroup = ref({
  groupid: "",
  messagecount: "",
  comment: "",
});

const groupRestoreSuccessful = ref(null);
const selectedClassifier = ref(null);
const classifiers = ref([]);

async function getGroupingClassifiers() {
  const response = await useFetchFromServiceControl("recoverability/classifiers");
  const data = await response.json();
  classifiers.value = data;
}

function saveDefaultGroupingClassifier(classifier) {
  const cookies = useCookies().cookies;
  cookies.set("archived_groups_classification", classifier);
}

function classifierChanged(classifier) {
  saveDefaultGroupingClassifier(classifier);

  selectedClassifier.value = classifier;
  archiveGroups.value = [];
  messageGroupList.value = loadArchivedMessageGroups(classifier);
}

async function getArchiveGroups(classifier) {
  const result = await useGetArchiveGroups(classifier);
  if (result.length === 0 && undismissedRestoreGroups.value.length > 0) {
    undismissedRestoreGroups.value.forEach((deletedGroup) => {
      deletedGroup.need_user_acknowledgement = true;
      deletedGroup.workflow_state.status = "restorecompleted";
    });
  }

  let maxIndex = archiveGroups.value.reduce((currentMax, currentGroup) => Math.max(currentMax, currentGroup.index), 0);

  result.forEach((serverGroup) => {
    const previousGroup = archiveGroups.value.find((oldGroup) => oldGroup.id === serverGroup.id);

    if (previousGroup) {
      serverGroup.index = previousGroup.index;
    } else {
      serverGroup.index = ++maxIndex;
    }
  });

  undismissedRestoreGroups.value.forEach((deletedGroup) => {
    if (!result.find((group) => group.id === deletedGroup.id)) {
      deletedGroup.need_user_acknowledgement = true;
      deletedGroup.workflow_state.status = "restorecompleted";
    }
  });

  // need a map in some ui state for controlling animations
  archiveGroups.value = result
    .filter((group) => !undismissedRestoreGroups.value.find((deletedGroup) => deletedGroup.id === group.id))
    .map(initializeGroupState)
    .concat(undismissedRestoreGroups.value)
    .sort((group1, group2) => {
      return group1.index - group2.index;
    });

  if (archiveGroups.value.length !== stats.number_of_archive_groups) {
    stats.number_of_archive_groups = archiveGroups.value.length;
  }
}

function initializeGroupState(group) {
  let operationStatus = (group.operation_status ? group.operation_status.toLowerCase() : null) || "none";
  if (operationStatus === "preparing" && group.operation_progress === 1) {
    operationStatus = "queued";
  }

  group.workflow_state = createWorkflowState(operationStatus, group.operation_progress, group.operation_failed);
  return group;
}

function loadDefaultGroupingClassifier() {
  const cookies = useCookies().cookies;
  const cookieGrouping = cookies.get("archived_groups_classification");

  if (cookieGrouping) {
    return cookieGrouping;
  }

  return null;
}

async function loadArchivedMessageGroups(groupBy) {
  loadingData.value = true;
  if (!initialLoadComplete.value || !groupBy) {
    groupBy = loadDefaultGroupingClassifier();
  }

  await getArchiveGroups(groupBy ?? route.query.deletedGroupBy);
  loadingData.value = false;
  initialLoadComplete.value = true;

  emit("InitialLoadComplete");
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

//Restore operation
function showRestoreGroupDialog(group) {
  groupRestoreSuccessful.value = null;
  selectedGroup.value = group;
  showRestoreGroupModal.value = true;
}

async function restoreGroup() {
  // We're starting a restore, poll more frequently
  changeRefreshInterval(1000);

  selectedGroup.value = archiveGroups.value.find((group) => group.id === selectedGroup.value.id);

  undismissedRestoreGroups.value.push(selectedGroup.value);

  const group = selectedGroup.value;
  group.workflow_state = { status: "restorestarted", message: "Restore request initiated..." };
  group.operation_start_time = new Date().toUTCString();

  const result = await useRestoreGroup(group.id);
  if (result.message === "success") {
    groupRestoreSuccessful.value = true;
    useShowToast("info", "Info", "Group restore started...");
  } else {
    groupRestoreSuccessful.value = false;
    useShowToast("error", "Error", "Failed to restore the group:" + result.message);
  }
}

const statusesForRestoreOperation = ["restorestarted", "restoreprogressing", "restorefinalizing", "restorecompleted"];

//getClasses
const getClasses = function (stepStatus, currentStatus, statusArray) {
  const indexOfStep = statusArray.indexOf(stepStatus);
  const indexOfCurrent = statusArray.indexOf(currentStatus);
  if (indexOfStep > indexOfCurrent) {
    return "left-to-do";
  } else if (indexOfStep === indexOfCurrent) {
    return "active";
  }

  return "completed";
};

function getClassesForRestoreOperation(stepStatus, currentStatus) {
  return getClasses(stepStatus, currentStatus, statusesForRestoreOperation);
}

const acknowledgeGroup = function (dismissedGroup) {
  undismissedRestoreGroups.value.splice(
    undismissedRestoreGroups.value.findIndex((group) => {
      return group.id === dismissedGroup.id;
    }),
    1
  );

  archiveGroups.value.splice(
    archiveGroups.value.findIndex((group) => group.id === dismissedGroup.id),
    1
  );
};

function isBeingRestored(status) {
  return statusesForRestoreOperation.includes(status);
}

function navigateToGroup($event, groupId) {
  if ($event.target.localName !== "button") {
    router.push(routeLinks.failedMessage.deletedGroup.link(groupId));
  }
}

function isRestoreInProgress() {
  return archiveGroups.value.some((group) => group.workflow_state.status !== "none" && group.workflow_state.status !== "restorecompleted");
}

function changeRefreshInterval(milliseconds) {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(() => {
    // If we're currently polling at 5 seconds and there is a restore in progress, then change the polling interval to poll every 1 second
    if (!pollingFaster && isRestoreInProgress()) {
      changeRefreshInterval(1000);
      pollingFaster = true;
    } else if (pollingFaster && !isRestoreInProgress()) {
      // if we're currently polling every 1 second and all restores are done, change polling frequency back to every 5 seconds
      changeRefreshInterval(5000);
      pollingFaster = false;
    }

    loadArchivedMessageGroups();
  }, milliseconds);
}

onUnmounted(() => {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }
});

onMounted(async () => {
  await getGroupingClassifiers();
  let savedClassifier = loadDefaultGroupingClassifier();
  if (!savedClassifier) {
    savedClassifier = classifiers.value[0];
  }

  selectedClassifier.value = savedClassifier;
  await loadArchivedMessageGroups();

  changeRefreshInterval(5000);
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <ServiceControlNotAvailable />
    <template v-if="!connectionState.unableToConnect">
      <section name="message_groups">
        <div class="row">
          <div class="col-6 list-section">
            <h3>Deleted message group</h3>
          </div>

          <div class="col-6 toolbar-menus no-side-padding">
            <div class="msg-group-menu dropdown">
              <label class="control-label">Group by:</label>
              <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {{ selectedClassifier }}
                <span class="caret"></span>
              </button>
              <ul class="dropdown-menu">
                <li v-for="(classifier, index) in classifiers" :key="index">
                  <a @click.prevent="classifierChanged(classifier)">{{ classifier }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="box-container">
          <div class="messagegrouplist">
            <div ref="messageGroupList">
              <div class="row">
                <div class="col-sm-12">
                  <no-data v-if="archiveGroups.length === 0 && !loadingData" title="message groups" message="There are currently no grouped message failures"></no-data>
                </div>
              </div>

              <div class="row">
                <div class="col-sm-12 no-mobile-side-padding">
                  <div v-if="archiveGroups.length > 0">
                    <div
                      class="row box box-group wf-{{group.workflow_state.status}} repeat-modify"
                      v-for="(group, index) in archiveGroups"
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
                                <p class="lead break" v-bind:class="{ 'msg-type-hover': group.hover2, 'msg-type-hover-off': group.hover3 }">{{ group.title }}</p>
                                <p class="metadata" v-if="!isBeingRestored(group.workflow_state.status)">
                                  <span class="metadata">
                                    <i aria-hidden="true" class="fa fa-envelope"></i>
                                    {{ group.count }} message<span v-if="group.count > 1">s</span>
                                    <span v-if="group.operation_remaining_count > 0"> (currently restoring {{ group.operation_remaining_count }} </span>
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

                            <div class="row" v-if="!isBeingRestored(group.workflow_state.status)">
                              <div class="col-sm-12 no-side-padding">
                                <button
                                  type="button"
                                  class="btn btn-link btn-sm"
                                  :disabled="group.count === 0 || isBeingRestored(group.workflow_state.status)"
                                  @mouseenter="group.hover3 = true"
                                  @mouseleave="group.hover3 = false"
                                  v-if="archiveGroups.length > 0"
                                  @click="showRestoreGroupDialog(group)"
                                >
                                  <i aria-hidden="true" class="fa fa-repeat no-link-underline">&nbsp;</i>Restore group
                                </button>
                              </div>
                            </div>

                            <!--isBeingRestored-->
                            <div class="row" v-if="isBeingRestored(group.workflow_state.status)">
                              <div class="col-sm-12 no-side-padding">
                                <div class="panel panel-default panel-retry">
                                  <div class="panel-body">
                                    <ul class="retry-request-progress">
                                      <li v-if="group.workflow_state.status !== 'restorecompleted'" :class="getClassesForRestoreOperation('restorestarted', group.workflow_state.status)">
                                        <div class="bulk-retry-progress-status">Restore request in progress...</div>
                                      </li>
                                      <li v-if="group.workflow_state.status === 'restorecompleted'">
                                        <div class="retry-completed bulk-retry-progress-status">Restore request completed</div>
                                        <button type="button" class="btn btn-default btn-primary btn-xs btn-retry-dismiss" v-if="group.need_user_acknowledgement == true" @click="acknowledgeGroup(group)">Dismiss</button>
                                      </li>
                                    </ul>
                                    <div class="op-metadata">
                                      <span class="metadata"><i aria-hidden="true" class="fa fa-clock-o"></i> Restore request started:<time-since :date-utc="group.operation_start_time"></time-since></span>
                                      <span class="metadata" v-if="group.workflow_state.status === 'restorecompleted'"><i aria-hidden="true" class="fa fa-envelope"></i> Messages restored: {{ group.count }}</span>
                                      <span class="metadata" v-if="group.workflow_state.status !== 'restorecompleted'"><i aria-hidden="true" class="fa fa-envelope"></i> Messages being restored: {{ group.count }}</span>
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
          </div>
          <!--modal display - restore group-->
          <Teleport to="#modalDisplay">
            <ConfirmDialog
              v-if="showRestoreGroupModal"
              @cancel="showRestoreGroupModal = false"
              @confirm="
                showRestoreGroupModal = false;
                restoreGroup();
              "
              :heading="'Are you sure you want to restore this group?'"
              :body="`Restored messages will be moved back to the list of failed messages`"
            ></ConfirmDialog>
          </Teleport>
        </div>
      </section>
    </template>
  </template>
</template>
<style>
.fake-link i {
  padding-right: 0.2em;
}

.msg-group-menu.dropdown {
  float: right;
}
</style>
