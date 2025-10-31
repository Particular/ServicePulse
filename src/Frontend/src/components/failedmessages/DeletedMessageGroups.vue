<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useShowToast } from "../../composables/toast";
import NoData from "../NoData.vue";
import TimeSince from "../TimeSince.vue";
import LicenseNotExpired from "../../components/LicenseNotExpired.vue";
import ServiceControlAvailable from "../ServiceControlAvailable.vue";
import ConfirmDialog from "../ConfirmDialog.vue";
import routeLinks from "@/router/routeLinks";
import { TYPE } from "vue-toastification";
import MetadataItem from "@/components/MetadataItem.vue";
import ActionButton from "@/components/ActionButton.vue";
import { faArrowRotateRight, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { useDeletedMessageGroupsStore, statusesForRestoreOperation, ExtendedFailureGroupView, Status } from "@/stores/DeletedMessageGroupsStore";
import { useStoreAutoRefresh } from "@/composables/useAutoRefresh";
import { storeToRefs } from "pinia";

let pollingFaster = false;
const { autoRefresh, isRefreshing, updateInterval } = useStoreAutoRefresh("deletedMessageGroups", useDeletedMessageGroupsStore, 5000);
const { store } = autoRefresh();
const { archiveGroups, classifiers, selectedClassifier } = storeToRefs(store);
const router = useRouter();
const showRestoreGroupModal = ref(false);
const selectedGroup = ref<ExtendedFailureGroupView>();
const groupRestoreSuccessful = ref<boolean | null>(null);

async function classifierChanged(classifier: string) {
  store.setGrouping(classifier);
  selectedClassifier.value = classifier;

  await store.refresh();
}

//Restore operation
function showRestoreGroupDialog(group: ExtendedFailureGroupView) {
  groupRestoreSuccessful.value = null;
  selectedGroup.value = group;
  showRestoreGroupModal.value = true;
}

async function restoreGroup() {
  const group = selectedGroup.value;
  if (group) {
    const { result, errorMessage } = await store.restoreGroup(group);
    if (!result) {
      groupRestoreSuccessful.value = false;
      useShowToast(TYPE.ERROR, "Error", `Failed to restore the group: ${errorMessage}`);
    } else {
      // We're starting a restore, poll more frequently
      pollingFaster = true;
      updateInterval(1000);
      groupRestoreSuccessful.value = true;
      useShowToast(TYPE.INFO, "Info", "Group restore started...");
    }
  }
}

//getClasses
const getClasses = function (stepStatus: Status, currentStatus: Status, statusArray: readonly Status[]) {
  const indexOfStep = statusArray.indexOf(stepStatus);
  const indexOfCurrent = statusArray.indexOf(currentStatus);
  if (indexOfStep > indexOfCurrent) {
    return "left-to-do";
  } else if (indexOfStep === indexOfCurrent) {
    return "active";
  }

  return "completed";
};

function getClassesForRestoreOperation(stepStatus: Status, currentStatus: Status) {
  return getClasses(stepStatus, currentStatus, statusesForRestoreOperation);
}

function isBeingRestored(status: Status) {
  return (statusesForRestoreOperation as readonly Status[]).includes(status);
}

function navigateToGroup(groupId: string) {
  router.push(routeLinks.failedMessage.deletedGroup.link(groupId));
}

function isRestoreInProgress() {
  return archiveGroups.value.some((group) => group.workflow_state.status !== "none" && group.workflow_state.status !== "restorecompleted");
}

watch(isRefreshing, () => {
  // If we're currently polling at 5 seconds and there is a restore in progress, then change the polling interval to poll every 1 second
  if (!pollingFaster && isRestoreInProgress()) {
    pollingFaster = true;
    updateInterval(1000);
  } else if (pollingFaster && !isRestoreInProgress()) {
    // if we're currently polling every 1 second and all restores are done, change polling frequency back to every 5 seconds
    pollingFaster = false;
    updateInterval(5000);
  }
});
</script>

<template>
  <ServiceControlAvailable>
    <LicenseNotExpired>
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
            <div>
              <div class="row">
                <div class="col-sm-12">
                  <no-data v-if="archiveGroups.length === 0 && !isRefreshing" title="message groups" message="There are currently no grouped message failures"></no-data>
                </div>
              </div>

              <div class="row">
                <div class="col-sm-12 no-mobile-side-padding">
                  <div v-if="archiveGroups.length > 0">
                    <div :class="`row box box-group wf-${group.workflow_state.status} repeat-modify deleted-message-group`" v-for="(group, index) in archiveGroups" :key="index" :disabled="group.count == 0" @click.prevent="navigateToGroup(group.id)">
                      <div class="col-sm-12 no-mobile-side-padding">
                        <div class="row">
                          <div class="col-sm-12 no-side-padding">
                            <div class="row box-header">
                              <div class="col-sm-12 no-side-padding">
                                <p class="lead break">{{ group.title }}</p>
                                <p class="metadata" v-if="!isBeingRestored(group.workflow_state.status)">
                                  <MetadataItem :icon="faEnvelope">
                                    <span>{{ group.count }} message<span v-if="group.count > 1">s</span></span>
                                    <span v-if="group.operation_remaining_count"> (currently restoring {{ group.operation_remaining_count }} </span>
                                  </MetadataItem>

                                  <MetadataItem :icon="faClock">
                                    First failed:
                                    <time-since :date-utc="group.first"></time-since>
                                  </MetadataItem>

                                  <MetadataItem :icon="faClock">
                                    Last failed:
                                    <time-since :date-utc="group.last"></time-since>
                                  </MetadataItem>

                                  <MetadataItem :icon="faArrowRotateRight"> Last retried: <time-since :date-utc="group.last_operation_completion_time"></time-since> </MetadataItem>
                                </p>
                              </div>
                            </div>

                            <div class="row" v-if="!isBeingRestored(group.workflow_state.status)">
                              <div class="col-sm-12 no-side-padding">
                                <ActionButton
                                  variant="link"
                                  size="sm"
                                  :icon="faArrowRotateRight"
                                  :disabled="group.count === 0 || isBeingRestored(group.workflow_state.status)"
                                  v-if="archiveGroups.length > 0"
                                  @click.stop="showRestoreGroupDialog(group)"
                                >
                                  Restore group
                                </ActionButton>
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
                                        <button type="button" class="btn btn-default btn-primary btn-xs btn-retry-dismiss" v-if="group.need_user_acknowledgement == true" @click.stop="store.acknowledgeGroup(group)">Dismiss</button>
                                      </li>
                                    </ul>
                                    <div class="op-metadata">
                                      <MetadataItem :icon="faClock"> Restore request started: <time-since :date-utc="group.operation_start_time"></time-since> </MetadataItem>
                                      <MetadataItem v-if="group.workflow_state.status === 'restorecompleted'" :icon="faEnvelope"> Messages restored: {{ group.count }} </MetadataItem>
                                      <MetadataItem v-if="group.workflow_state.status !== 'restorecompleted'" :icon="faEnvelope"> Messages being restored: {{ group.count }} </MetadataItem>
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
    </LicenseNotExpired>
  </ServiceControlAvailable>
</template>

<style scoped>
@import "../list.css";
@import "./failedmessages.css";

.fake-link i {
  padding-right: 0.2em;
}

.msg-group-menu.dropdown {
  float: right;
}

.dropdown > button:hover {
  background: none;
  border: none;
  color: var(--sp-blue);
  text-decoration: underline;
}
</style>
