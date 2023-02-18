<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { connectionState } from "../composables/serviceServiceControl";
import { useFetchFromServiceControl } from "../composables/serviceServiceControlUrls";
import stackTrace from "../components/message/StackTrace.vue";
import NoData from "../components/NoData.vue";
import TimeSince from "../components/TimeSince.vue";

const route = useRoute();
const id = route.params.id;
const messageErrorDetails = ref([]);
const failedMessage = ref({
    data: {},
});
const fetchError = ref({
    error: false,
});

const routes = {
    path: "/failed-messages/message/:id",
    "stack-trace": { component: stackTrace, title: "Stack Trace" },
};

function loadFailedMessage() {
    return useFetchFromServiceControl("errors/last/" + id)
        .then((response) => {
            if (response.status === 404){
                failedMessage.value.data = { notFound: true };
            } else if (response.status === 200){
                failedMessage.value.data = {};
            } else {
                failedMessage.value.data = { error: true }
            }
            return response.json();
        })
        .then((data) => {            
            var message = data;
            message.archived = message.status === 'archived';
            message.resolved = message.status === 'resolved';
            message.retried = message.status === 'retryIssued';
            failedMessage.value.data = message;
        })
        .catch((err) => {
            console.log(err);
            return;
    });
}

function getMessageErrorDetails() {
  return useFetchFromServiceControl("errors/last/" + id)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        messageErrorDetails.value = [];
        messageErrorDetails.value = data;
    })
    .catch((err) => {
        console.log(err);
        fetchError.value.error = true;
        return {};
    });
}

const currentPath = ref(window.location.hash);
window.addEventListener("hashchange", () => {
  currentPath.value = window.location.hash;
});
function subIsActive(subPath) {
  return currentPath.value === subPath;
}
const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || "/"]
    ? routes[currentPath.value.slice(1) || "/"].component
    : stackTrace;
});
const currentEvents = ref({});
watch(currentPath, async () => {
  if (routes[currentPath.value.slice(1) || "/"]) {
    document.title =
      routes[currentPath.value.slice(1) || "/"].title +
      " - Message � ServicePulse";
  }
});

onMounted(() => {
    loadFailedMessage();
  //getMessageErrorDetails();
});
</script>

<template>
    <section name="failed_message">
        <no-data
            v-if="failedMessage.data?.notFound"
            title="message failures"
            message="Could not find message. This could be because the message URL is invalid or the corresponding message was processed and is no longer tracked by ServiceControl."
        ></no-data>
        <no-data 
            v-if="failedMessage.data?.error" 
            title="message failures" 
            message="An error occurred while trying to load the message. Please check the ServiceControl logs to learn what the issue is.">
        </no-data>
        <div v-if="!failedMessage.data?.error && !failedMessage.data?.notFound" class="container">
            <div class="row">
                <div class="col-sm-12">   
                    <div class="active break group-title">
                        <h1 class="message-type-title">{{ failedMessage.data.message_type }}</h1>
                    </div>        
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <div class="metadata group-title group-message-count message-metadata">
                        <span v-if="failedMessage.data.retried" title="Message is being retried" class="label sidebar-label label-info metadata-label">Retried</span>
                        <span v-if="failedMessage.data.archived" title="Message is being deleted" class="label sidebar-label label-warning metadata-label">Deleted</span>
                        <span v-if="failedMessage.data.resolved" title="Message was processed successfully" class="label sidebar-label label-warning metadata-label">Processed</span>
                        <span v-if="failedMessage.data.number_of_processing_attempts > 1" tooltip="This message has already failed {{failedMessage.data.number_of_processing_attempts}} times" class="label sidebar-label label-important metadata-label">{{messageErrorDetails.number_of_processing_attempts}} Retry Failures</span>
                        <span class="metadata"><i class="fa fa-clock-o"></i> Failed: <time-since :date-utc="failedMessage.data.time_of_failure"></time-since></span>
                        <span class="metadata"><i class="fa pa-endpoint"></i> Endpoint: {{ failedMessage.data.receiving_endpoint?.name }}</span>
                        <span class="metadata"><i class="fa fa-laptop"></i> Machine: {{ failedMessage.data.receiving_endpoint?.host }}</span>
                    </div>
                </div>
            </div>
            <div class="row" ng-show="vm.message">
                <div class="col-sm-12">
                    <div class="btn-toolbar message-toolbar">
                        <button type="button" v-if="!failedMessage.data.archived" :disabled="failedMessage.data.retried || failedMessage.data.resolved" class="btn btn-default" confirm-title="Are you sure you want to delete this message?" confirm-message="If you delete, this message won't be available for retrying unless it is later restored." confirm-click="vm.archiveMessage()"><i class="fa fa-trash"></i> Delete message</button>
                        <button type="button" v-if="failedMessage.data.archived" class="btn btn-default" confirm-title="Are you sure you want to restore this message?" confirm-message="Restored message will be moved back to the list of failed messages." confirm-click="vm.unarchiveMessage()"><i class="fa fa-undo"></i> Restore</button>
                        <button type="button" :disabled="failedMessage.data.retried || failedMessage.data.archived || failedMessage.data.resolved" class="btn btn-default" confirm-title="Are you sure you want to retry this message?" confirm-message="Are you sure you want to retry this message?" confirm-click="vm.retryMessage()"><i class="fa fa-refresh"></i> Retry message</button>
                        <button type="button" class="btn btn-default" ng-show="vm.isEditAndRetryEnabled" ng-click="vm.editMessage()"><i class="fa fa-pencil"></i> Edit & retry</button>
                        <button type="button" class="btn btn-default" ng-click="vm.debugInServiceInsight($index)" tooltip="Browse this message in ServiceInsight, if installed"><img src="img/si-icon.svg"> View in ServiceInsight</button>
                        <button type="button" class="btn btn-default" ng-click="vm.exportMessage()" ng-show="!vm.message.notFound && !vm.message.error"><i class="fa fa-download"></i> Export message</button>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <div class="tabs">
                    <h5
                        :class="{
                        active: subIsActive('#stack-trace') || subIsActive(''),
                        disabled:
                            !connectionState.connected &&
                            !connectionState.connectedRecently,
                        }"
                    >
                        <a href="#stack-trace">Stack Trace</a>
                    </h5>
                    <h5
                        :class="{
                        active: subIsActive('#headers'),
                        disabled:
                            !connectionState.connected &&
                            !connectionState.connectedRecently,
                        }"
                    >
                        <a href="#headers">Headers</a>
                    </h5>
                    <h5
                        :class="{
                        active: subIsActive('#message-body'),
                        disabled:
                            !connectionState.connected &&
                            !connectionState.connectedRecently,
                        }"
                    >
                        <a href="#message-body">Message Body</a>
                    </h5>
                    <h5
                        :class="{
                        active: subIsActive('#flow-diagram'),
                        disabled:
                            !connectionState.connected &&
                            !connectionState.connectedRecently,
                        }"
                    >
                        <a href="#flow-diagram">Flow Diagram</a>
                    </h5>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <pre isolate-click>{{ failedMessage.data.exception.stack_trace }}</pre>
                </div>
            </div>
            <component :is="currentView" v-on="currentEvents" />
        </div>
    </section>   
</template>

<style></style>
