<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useFetchFromServiceControl } from "../composables/serviceServiceControlUrls";
import NoData from "../components/NoData.vue";
import TimeSince from "../components/TimeSince.vue";

const route = useRoute();
const id = route.params.id;
const failedMessage = ref({});

function loadFailedMessage() {
  return useFetchFromServiceControl("errors/last/" + id)
    .then((response) => {
      if (response.status === 404) {
        failedMessage.value = { notFound: true };
      } else {
        failedMessage.value = { error: true };
      }
      return response.json();
    })
    .then((data) => {
      var message = data;
      message.archived = message.status === "archived";
      message.resolved = message.status === "resolved";
      message.retried = message.status === "retryIssued";
      failedMessage.value = message;
    })
    .catch((err) => {
      console.log(err);
      return;
    });
}

function downloadHeadersAndBody() {
    return useFetchFromServiceControl("messages/search/" + id)
    .then((response) => {
      /* if (response.status === 404) {
        failedMessage.value = { notFound: true };
      } else {
        failedMessage.value = { error: true };
      } */
      return response.json();
    })
    .then((data) => {
      var message = data[0];
      var headers = message.headers;
      //message.headers = messageHeaders.value;
      failedMessage.value.headers = headers;
    })
    .catch((err) => {
      console.log(err);
      return;
    });
}

function togglePanel(panelNum) {
  if (failedMessage.value.notFound || failedMessage.value.error) return false;

  failedMessage.value.panel = panelNum;
  return false;
}

onMounted(() => {
  loadFailedMessage().then(() => { togglePanel(1); });
  downloadHeadersAndBody();
});
</script>

<template>
  <section name="failed_message">
    <no-data v-if="failedMessage?.notFound" title="message failures" message="Could not find message. This could be because the message URL is invalid or the corresponding message was processed and is no longer tracked by ServiceControl."></no-data>
    <no-data v-if="failedMessage?.error" title="message failures" message="An error occurred while trying to load the message. Please check the ServiceControl logs to learn what the issue is."></no-data>
    <div v-if="!failedMessage?.error && !failedMessage?.notFound" class="container">
      <div class="row">
        <div class="col-sm-12">
          <div class="active break group-title">
            <h1 class="message-type-title">{{ failedMessage.message_type }}</h1>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div class="metadata group-title group-message-count message-metadata">
            <span v-if="failedMessage.retried" title="Message is being retried" class="label sidebar-label label-info metadata-label">Retried</span>
            <span v-if="failedMessage.archived" title="Message is being deleted" class="label sidebar-label label-warning metadata-label">Deleted</span>
            <span v-if="failedMessage.resolved" title="Message was processed successfully" class="label sidebar-label label-warning metadata-label">Processed</span>
            <span v-if="failedMessage.number_of_processing_attempts > 1" title="This message has already failed {{failedMessage.number_of_processing_attempts}} times" class="label sidebar-label label-important metadata-label">{{ failedMessage.number_of_processing_attempts }} Retry Failures</span>
            <span class="metadata"><i class="fa fa-clock-o"></i> Failed: <time-since :date-utc="failedMessage.time_of_failure"></time-since></span>
            <span class="metadata"><i class="fa pa-endpoint"></i> Endpoint: {{ failedMessage.receiving_endpoint?.name }}</span>
            <span class="metadata"><i class="fa fa-laptop"></i> Machine: {{ failedMessage.receiving_endpoint?.host }}</span>
            <span class="metadata" ng-show="failedMessage.redirect"><i class="fa pa-redirect-source pa-redirect-small"></i> Redirect: {{ failedMessage.redirect }}</span>
          </div>
          <div class="metadata group-title group-message-count message-metadata" ng-show="failedMessage.archived">
            <span class="metadata"><i class="fa fa-clock-o"></i> Deleted: <sp-moment date="{{vm.message.last_modified}}"></sp-moment></span>
            <span class="metadata danger" ng-show="message.delete_soon"><i class="fa fa-trash-o danger"></i> Scheduled for permanent deletion: immediately</span>
            <span class="metadata danger" ng-show="!message.delete_soon"><i class="fa fa-trash-o danger"></i> Scheduled for permanent deletion: <sp-moment class="danger" date="{{vm.message.deleted_in}}"></sp-moment></span>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div class="btn-toolbar message-toolbar">
            <button type="button" v-if="!failedMessage.archived" :disabled="failedMessage.retried || failedMessage.resolved" class="btn btn-default" confirm-title="Are you sure you want to delete this message?" confirm-message="If you delete, this message won't be available for retrying unless it is later restored." confirm-click="vm.archiveMessage()"><i class="fa fa-trash"></i> Delete message </button>
            <button type="button" v-if="failedMessage.archived" class="btn btn-default" confirm-title="Are you sure you want to restore this message?" confirm-message="Restored message will be moved back to the list of failed messages." confirm-click="vm.unarchiveMessage()"><i class="fa fa-undo"></i> Restore </button>
            <button type="button" :disabled="failedMessage.retried || failedMessage.archived || failedMessage.resolved" class="btn btn-default" confirm-title="Are you sure you want to retry this message?" confirm-message="Are you sure you want to retry this message?" confirm-click="vm.retryMessage()"><i class="fa fa-refresh"></i> Retry message </button>
            <button type="button" class="btn btn-default" ng-show="vm.isEditAndRetryEnabled" ng-click="vm.editMessage()"><i class="fa fa-pencil"></i> Edit & retry </button>
            <button type="button" class="btn btn-default" ng-click="vm.debugInServiceInsight($index)" tooltip="Browse this message in ServiceInsight, if installed"><img src="../assets/si-icon.svg" /> View in ServiceInsight </button>
            <button type="button" class="btn btn-default" ng-click="vm.exportMessage()" ng-show="!vm.message.notFound && !vm.message.error"><i class="fa fa-download"></i> Export message </button>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div class="row">
            <div isolate-click class="col-sm-12 no-side-padding">
              <div class="tabs msg-tabs">
                <h5 :class="{ active: failedMessage.panel === 1 }" v-on:click="togglePanel(1)"><a>Stacktrace</a></h5>
                <h5 :class="{ active: failedMessage.panel === 2 }" v-on:click="togglePanel(2)"><a>Headers</a></h5>
                <h5 :class="{ active: failedMessage.panel === 3 }" v-on:click="togglePanel(3)"><a>Message body</a></h5>
                <h5 :class="{ active: failedMessage.panel === 4 }" v-on:click="togglePanel(4)"><a>Flow Diagram</a></h5>
              </div>

              <pre isolate-click v-if="failedMessage.panel === 0">{{ failedMessage.exception?.message }}</pre> 
              <pre isolate-click v-if="failedMessage.panel === 1">{{ failedMessage.exception?.stack_trace }}</pre>
              <table isolate-click class="table" v-if="failedMessage.panel === 2 && failedMessage.headers">
                    <tbody>
                        <tr class="interactiveList" v-for="(header, index) in failedMessage.headers" :key="index">
                            <td nowrap="nowrap">{{ header.key }}</td>
                            <td>
                                <pre>{{ header.value }}</pre>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div isolate-click class="alert alert-info" v-if="failedMessage.panel === 2 && failedMessage.headersUnavailable">{{ failedMessage.headersUnavailable }}</div>
                <pre isolate-click v-if="failedMessage.panel === 3 && failedMessage.messageBody">{{ failedMessage.messageBody }}</pre>
                <div isolate-click class="alert alert-info" v-if="failedMessage.panel === 3 && failedMessage.bodyUnavailable">{{ failedMessage.bodyUnavailable }}</div>
                <flow-diagram v-if="failedMessage.conversationId" conversation-id="{{failedMessage.conversationId}}" v-show="failedMessage.panel === 4"></flow-diagram>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style></style>
