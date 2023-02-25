
<script setup>
    import { ref, onMounted } from "vue";
    import NoData from "../NoData.vue";
    import TimeSince from "../TimeSince.vue";
    import { licenseStatus } from "../../composables/serviceLicense.js";
    import LicenseExpired from "../../components/LicenseExpired.vue";
    import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
    import FailedMessageGroupRestore from "./FailedMessageGroupRestore.vue";
    import { stats, connectionState } from "../../composables/serviceServiceControl.js";
    import { useShowToast } from "../../composables/toast.js";
    import { useGetArchiveGroups, useAcknowledgeArchiveGroup, useRestoreGroup } from "../../composables/serviceMessageGroup.js";

    const archiveGroups = ref([]);
    const loadingData = ref(true);
    const initialLoadComplete = ref(false);
    const emit = defineEmits(["InitialLoadComplete", "ExceptionGroupCountUpdated"]);


    const showRestoreGroupModal = ref(false);

    const selectedGroup = ref({
        groupid: "",
        messagecount: "",
        comment: "",
    });

    const groupRestoreSuccessful = ref(null);

    function getArchiveGroups() {
        archiveGroups.value = [];

        return useGetArchiveGroups().then((result) => {
            archiveGroups.value = result;
            if (result.length > 0) {
                // need a map in some ui state for controlling animations
                archiveGroups.value = result.map(initializeGroupState);

                if (archiveGroups.value.length !== stats.number_of_archive_groups) {
                    stats.number_of_archive_groups = archiveGroups.value.length;
                    emit("ArchiveGroupCountUpdated", stats.number_of_archive_groups);
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

        getArchiveGroups().then(() => {
            loadingData.value = false;
            initialLoadComplete.value = true;
            emit("InitialLoadComplete");
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

    //Restore operation
    function restoreGroup(group) {
        groupRestoreSuccessful.value = null;
        selectedGroup.value.groupid = group.id;
        selectedGroup.value.messagecount = group.count;
        showRestoreGroupModal.value = true;
    }
    function saveRestoreGroup(group) {
        showRestoreGroupModal.value = false;
        group.workflow_state = { status: "waiting", message: "Restore Group Request Enqueued..." };


        useRestoreGroup(group.groupid).then((result) => {
            if (result.message === "success") {
                groupRestoreSuccessful.value = true;
                emit("RestoreGroupRequestAccepted", group);
            } else {
                groupRestoreSuccessful.value = false;
                useShowToast("error", "Error", "Failed to restore the group:" + result.message);
            }
        });
    }
    var statusesForRestoreOperation = ["restorestarted", "restoreprogressing", "restorefinalizing", "restorecompleted"];
    function getClassesForRestoreOperation(stepStatus, currentStatus) {
        return getClasses(stepStatus, currentStatus, statusesForRestoreOperation);
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
                // archiveGroups.splice(archiveGroups.indexOf(group), 1);
                useShowToast("info", "Info", "Group restored succesfully");
                getArchiveGroups(); //reload the groups
            } else {
                useShowToast("error", "Error", "Acknowledging Group Failed':" + result.message);
            }
        });
    };


    function isBeingRestored(status) {
        return statusesForRestoreOperation.includes(status);
    }

    onMounted(() => {
        initialLoad();
    });
</script>

<template>
    <LicenseExpired />
    <template v-if="!licenseStatus.isExpired">
        <ServiceControlNotAvailable />
        <template v-if="!connectionState.unableToConnect">
            <section name="message_groups">
                <div class="box">
                    <div class="row">
                        <div class="col-sm-12">
                            <div class="list-section">
                                <h3>Deleted message groups</h3>
                                <div class="col-sm-7 form-group">


                                    <div>
                                        <div class="messagegrouplist">
                                            <div class="row">
                                                <div class="col-sm-12 toolbar-menus no-side-padding">
                                                    <div class="msg-group-menu dropdown">
                                                        <label class="control-label">Group by:</label>
                                                        <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                            vm.selectedClassification
                                                            <span class="caret"></span>
                                                        </button>
                                                        <ul class="dropdown-menu">
                                                            <li ng-repeat="classifier in vm.availableClassifiers">
                                                                <a href="#/failed-messages/groups?groupBy={{classifier}}">classifier</a>
                                                            </li>
                                                        </ul>
                                                    </div>

                                                </div>
                                            </div>

                                            <div class="row">
                                                <div class="col-sm-12">
                                                    <no-data v-if="archiveGroups.length === 0 && !loadingData" title="message groups" message="There are currently no grouped message failures"></no-data>
                                                </div>
                                            </div>

                                            <div class="row">
                                                <div class="col-sm-12 no-mobile-side-padding">
                                                    <div v-show="archiveGroups.length > 0">
                                                        <div class="row box box-group wf-{{group.workflow_state.status}} repeat-modify" v-for="(group, index) in archiveGroups" :key="index" v-show="archiveGroups.length > 0" :disabled="group.count == 0" @mouseenter="group.hover2 = true" @mouseleave="group.hover2 = false">
                                                            <div class="col-sm-12 no-mobile-side-padding">
                                                                <div class="row">
                                                                    <div class="col-sm-12 no-side-padding">
                                                                        <div class="row box-header">
                                                                            <div class="col-sm-12 no-side-padding">
                                                                                <p class="lead break" v-bind:class="{ 'msg-type-hover': group.hover2, 'msg-type-hover-off': group.hover3 }">
                                                                                    {{ group.title }}
                                                                                </p>
                                                                                <p class="metadata" v-show="!isBeingRestored(group.workflow_state.status) ">
                                                                                    <span class="metadata">
                                                                                        <i aria-hidden="true" class="fa fa-envelope"></i>
                                                                                        {{ group.count }} message<span v-show="group.count > 1">s</span>
                                                                                        <span v-show="group.operation_remaining_count > 0"> (currently restoring {{ group.operation_remaining_count }} </span>
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


                                                                        <div class="row" v-show="!isBeingRestored(group.workflow_state.status)">
                                                                            <div class="col-sm-12 no-side-padding">
                                                                                <button type="button" class="btn btn-link btn-sm" :disabled="group.count == 0 || isBeingRestored(group.workflow_state.status)"
                                                                                        @mouseenter="group.hover3 = true" @mouseleave="group.hover3 = false" v-if="archiveGroups.length > 0"
                                                                                        @click="restoreGroup(group)"><i aria-hidden="true" class="fa fa-repeat no-link-underline">&nbsp;</i>Restore group </button>
                                                                            </div>
                                                                        </div>

                                                                        <!--isBeingRestored-->
                                                                        <div class="row" v-show="isBeingRestored(group.workflow_state.status)">
                                                                            <div class="col-sm-12 no-side-padding">
                                                                                <div class="panel panel-default panel-retry">
                                                                                    <div class="panel-body">
                                                                                        <ul class="retry-request-progress">
                                                                                            <li v-hide="group.workflow_state.status === 'restorecompleted'" v-bind:class="getClassesForRestoreOperation('restorestarted', group.workflow_state.status)">
                                                                                                <div class="bulk-retry-progress-status">Initialize restore request...</div>
                                                                                            </li>
                                                                                            <li v-hide="group.workflow_state.status === 'restorecompleted'" v-bind:class="getClassesForRestoreOperation('restoreprogressing', group.workflow_state.status)">
                                                                                                <div class="row">
                                                                                                    <div class="col-xs-12 col-sm-4 col-md-3 no-side-padding">
                                                                                                        <div class="bulk-retry-progress-status">Restore request in progress...</div>
                                                                                                    </div>

                                                                                                    <div class="col-xs-12 col-sm-6">
                                                                                                        <div class="progress bulk-retry-progress" v-show="group.workflow_state.status === 'restoreprogressing'">
                                                                                                            <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="{{group.workflow_state.total}}" aria-valuemin="0" aria-valuemax="100" :style="{ 'min-width': '2em', width: group.workflow_state.total + '%' }">{{ group.workflow_state.total }}%</div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </li>
                                                                                            <li v-hide="group.workflow_state.status === 'restorecompleted'" v-bind:class="getClassesForRestoreOperation('restorefinalizing', group.workflow_state.status)">
                                                                                                <div class="row">
                                                                                                    <div class="col-xs-9 col-sm-4 col-md-3 no-side-padding">
                                                                                                        <div class="bulk-retry-progress-status">Cleaning up...</div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </li>
                                                                                            <li v-show="group.workflow_state.status === 'restorecompleted'">
                                                                                                <div class="retry-completed bulk-retry-progress-status">Restore request completed</div>
                                                                                                <button type="button" class="btn btn-default btn-primary btn-xs btn-retry-dismiss" v-show="group.need_user_acknowledgement == true" @click="acknowledgeGroup(group)">Dismiss</button>
                                                                                            </li>
                                                                                        </ul>
                                                                                        <div class="op-metadata">
                                                                                            <span class="metadata"><i aria-hidden="true" class="fa fa-clock-o"></i> Restore request started:<time-since :date-utc="group.operation_start_time"></time-since></span>
                                                                                            <span class="metadata"><i aria-hidden="true" class="fa fa-envelope"></i> Messages left to restore: <time-since :date-utc="group.operation_remaining_count"></time-since></span>
                                                                                            <span class="metadata"><i aria-hidden="true" class="fa fa-envelope"></i> Messages restored: <time-since :date-utc="group.operation_messages_completed_count"></time-since></span>
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
                                            <FailedMessageGroupRestore v-if="showRestoreGroupModal === true" v-bind="selectedGroup" :group_id="selectedGroup.groupid" @cancelRestoreGroup="showRestoreGroupModal = false" @restoreGroupConfirmed="saveRestoreGroup"></FailedMessageGroupRestore>
                                        </Teleport>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </template>
    </template>
</template>
<style>
    .fake-link i {
        padding-right: 0.2em;
    }

    .messagegrouplist {
        padding-bottom: 2em;
    }
</style>