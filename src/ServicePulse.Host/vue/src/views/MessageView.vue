<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useFetchFromServiceControl } from "../composables/serviceServiceControlUrls";
import NoData from "../components/NoData.vue";
import TimeSince from "../components/TimeSince.vue";
import moment from "moment";

const route = useRoute();
const id = route.params.id;
const failedMessage = ref({});

function loadFailedMessage() {
  return useFetchFromServiceControl("errors/last/" + id)
    .then((response) => {
      if (response.status === 404) {
        failedMessage.value = { notFound: true };
      } else if (response.status !== 200) {
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
      return getErrorRetentionPeriod();
    })
    .then(() => {
      return updateMessageDeleteDate();
    })
    .catch((err) => {
      console.log(err);
      return;
    });
}

function getErrorRetentionPeriod() {
  return useFetchFromServiceControl("configuration")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      var configuration = data;
      failedMessage.value.error_retention_period = moment.duration(configuration.data_retention.error_retention_period).asHours();
      return;
    });
}

function updateMessageDeleteDate() {
  var countdown = moment(failedMessage.value.last_modified).add(failedMessage.value.error_retention_period, "hours");
  failedMessage.value.delete_soon = countdown < moment();
  failedMessage.value.deleted_in = countdown.format();
}

function getEditAndRetryConfig() {
  return useFetchFromServiceControl("edit/config")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      failedMessage.value.isEditAndRetryEnabled = data.enabled;
    });
}

function downloadHeadersAndBody() {
  return useFetchFromServiceControl("messages/search/" + failedMessage.value.message_id)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data[0] === undefined) {
        failedMessage.value.headersNotFound = true;
        failedMessage.value.messageBodyNotFound = true;
        return;
      }
      var message = data[0];
      var headers = message.headers;
      failedMessage.value.headers = headers;
      return downloadBody();
    })
    .catch((err) => {
      console.log(err);
      return;
    });
}

function downloadBody() {
  return useFetchFromServiceControl("messages/" + failedMessage.value.message_id + "/body")
    .then((response) => {
      if (response.status === 404) {
        failedMessage.value.messageBodyNotFound = true;
      }
      return response.json();
    })
    .then((data) => {
      if (data === undefined) {
        failedMessage.value.messageBodyNotFound = true;
        return;
      }
      failedMessage.value.messageBody = data;
    })
    .catch((err) => {
      console.log(err);
      return;
    });
}

function togglePanel(panelNum) {
  if (!failedMessage.value.notFound && !failedMessage.value.error) {
    failedMessage.value.panel = panelNum;
  }

  return false;
}

onMounted(() => {
  loadFailedMessage()
    .then(() => {
      togglePanel(1);
    })
    .then(() => {
      downloadHeadersAndBody();
      getEditAndRetryConfig();
    });
});
</script>

<template>
  <div class="container">
    <section>
      <section name="failed_message">
        <no-data v-if="failedMessage?.notFound" title="message failures" message="Could not find message. This could be because the message URL is invalid or the corresponding message was processed and is no longer tracked by ServiceControl."></no-data>
        <no-data v-if="failedMessage?.error" title="message failures" message="An error occurred while trying to load the message. Please check the ServiceControl logs to learn what the issue is."></no-data>
        <div v-if="!failedMessage?.error && !failedMessage?.notFound">
          <div class="row">
            <div class="col-sm-12">
              <div class="active break group-title">
                <h1 class="message-type-title">{{ failedMessage.message_type }}</h1>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <div class="metadata group-title group-message-count message-metadata">
                <span v-if="failedMessage.retried" title="Message is being retried" class="label sidebar-label label-info metadata-label">Retried</span>
                <span v-if="failedMessage.archived" title="Message is being deleted" class="label sidebar-label label-warning metadata-label">Deleted</span>
                <span v-if="failedMessage.resolved" title="Message was processed successfully" class="label sidebar-label label-warning metadata-label">Processed</span>
                <span v-if="failedMessage.number_of_processing_attempts > 1" title="This message has already failed {{ failedMessage.number_of_processing_attempts }} times" class="label sidebar-label label-important metadata-label">{{ failedMessage.number_of_processing_attempts }} Retry Failures</span>
                <span class="metadata"><i class="fa fa-clock-o"></i> Failed: <time-since :date-utc="failedMessage.time_of_failure"></time-since></span>
                <span class="metadata"><i class="fa pa-endpoint"></i> Endpoint: {{ failedMessage.receiving_endpoint?.name }}</span>
                <span class="metadata"><i class="fa fa-laptop"></i> Machine: {{ failedMessage.receiving_endpoint?.host }}</span>
                <span class="metadata" v-if="failedMessage.redirect"><i class="fa pa-redirect-source pa-redirect-small"></i> Redirect: {{ failedMessage.redirect }}</span>
              </div>
              <div class="metadata group-title group-message-count message-metadata" v-if="failedMessage.archived">
                <span class="metadata"><i class="fa fa-clock-o"></i> Deleted: <time-since :date-utc="failedMessage.last_modified"></time-since></span>
                <span class="metadata danger" v-if="failedMessage.delete_soon"><i class="fa fa-trash-o danger"></i> Scheduled for permanent deletion: immediately</span>
                <span class="metadata danger" v-if="!failedMessage.delete_soon"><i class="fa fa-trash-o danger"></i> Scheduled for permanent deletion: <time-since :date-utc="failedMessage.deleted_in"></time-since></span>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <div class="btn-toolbar message-toolbar">
                <button type="button" v-if="!failedMessage.archived" :disabled="failedMessage.retried || failedMessage.resolved" class="btn btn-default" confirm-title="Are you sure you want to delete this message?" confirm-message="If you delete, this message won't be available for retrying unless it is later restored." confirm-click="vm.archiveMessage()"><i class="fa fa-trash"></i> Delete message</button>
                <button type="button" v-if="failedMessage.archived" class="btn btn-default" confirm-title="Are you sure you want to restore this message?" confirm-message="Restored message will be moved back to the list of failed messages." confirm-click="vm.unarchiveMessage()"><i class="fa fa-undo"></i> Restore</button>
                <button type="button" :disabled="failedMessage.retried || failedMessage.archived || failedMessage.resolved" class="btn btn-default" confirm-title="Are you sure you want to retry this message?" confirm-message="Are you sure you want to retry this message?" confirm-click="vm.retryMessage()"><i class="fa fa-refresh"></i> Retry message</button>
                <button type="button" class="btn btn-default" v-if="failedMessage.isEditAndRetryEnabled" ng-click="vm.editMessage()"><i class="fa fa-pencil"></i> Edit & retry</button>
                <button type="button" class="btn btn-default" ng-click="vm.debugInServiceInsight($index)" tooltip="Browse this message in ServiceInsight, if installed"><img src="../assets/si-icon.svg" /> View in ServiceInsight</button>
                <button type="button" class="btn btn-default" ng-click="vm.exportMessage()" ng-show="!vm.message.notFound && !vm.message.error"><i class="fa fa-download"></i> Export message</button>
              </div>
            </div>
          </div>
          <div class="row">
            <div isolate-click class="col-sm-12 no-side-padding">
              <div class="nav tabs msg-tabs">
                <h5 :class="{ active: failedMessage.panel === 1 }" class="nav-item" v-on:click="togglePanel(1)"><a href="#">Stacktrace</a></h5>
                <h5 :class="{ active: failedMessage.panel === 2 }" class="nav-item" v-on:click="togglePanel(2)"><a href="#">Headers</a></h5>
                <h5 :class="{ active: failedMessage.panel === 3 }" class="nav-item" v-on:click="togglePanel(3)"><a href="#">Message body</a></h5>
                <h5 :class="{ active: failedMessage.panel === 4 }" class="nav-item" v-on:click="togglePanel(4)"><a href="#">Flow Diagram</a></h5>
              </div>
              <pre isolate-click v-if="failedMessage.panel === 0">{{ failedMessage.exception?.message }}</pre>
              <pre isolate-click v-if="failedMessage.panel === 1">{{ failedMessage.exception?.stack_trace }}</pre>
              <table isolate-click class="table" v-if="failedMessage.panel === 2 && !failedMessage.headersNotFound">
                <tbody>
                  <tr class="interactiveList" v-for="(header, index) in failedMessage.headers" :key="index">
                    <td nowrap="nowrap">{{ header.key }}</td>
                    <td>
                      <pre>{{ header.value }}</pre>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div isolate-click class="alert alert-info" v-if="failedMessage.panel === 2 && failedMessage?.headersNotFound">Could not find message headers. This could be because the message URL is invalid or the corresponding message was processed and is no longer tracked by ServiceControl.</div>
              <pre isolate-click v-if="failedMessage.panel === 3 && !failedMessage?.messageBodyNotFound">{{ failedMessage.messageBody }}</pre>
              <div isolate-click class="alert alert-info" v-if="failedMessage.panel === 3 && failedMessage?.messageBodyNotFound">Could not find message body. This could be because the message URL is invalid or the corresponding message was processed and is no longer tracked by ServiceControl.</div>
              <flow-diagram v-if="failedMessage.conversationId" conversation-id="{{failedMessage.conversationId}}" v-show="failedMessage.panel === 4"></flow-diagram>
            </div>
          </div>
        </div>
      </section>
    </section>
  </div>
</template>

<style>
/* .row {
    margin-right: 0;
    margin-left: 0;
} */

.break {
  -ms-word-wrap: break-word;
  word-break: break-all;
  word-wrap: break-word;
}

h1.message-type-title {
  margin: 0 0 8px;
  font-size: 24px;
}

.group-title {
  display: block;
  font-size: 30px;
  margin: 10px 0 0;
}

h2.group-title,
h3.group-title {
  font-weight: bold;
  line-height: 28px;
}

.group-title.group-message-count sp-moment,
.group-title.group-message-count i {
  font-size: 16px;
  color: #777f7f;
}

.group-title {
  display: block;
  font-size: 30px;
  margin: 10px 0 0;
}

.metadata-label {
  margin-right: 24px;
  position: relative;
  top: -1px;
}

.label {
  display: inline;
  padding: 0.2em 0.6em 0.3em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25em;
}

.label-warning,
.badge-warning {
  background-color: #aa6708;
  border-color: #aa6708;
}

.group-message-count {
  color: #a8b3b1;
  font-size: 16px;
  margin: 4px 0 12px;
  display: block;
}

.label-important,
.badge-important {
  background-image: none;
}

.sidebar-label {
  box-shadow: none;
  color: #ffffff;
  display: inline-block;
  font-size: 12px;
  margin-top: 3px;
  max-width: 100%;
  padding: 6px 10px;
}

.message-metadata {
  display: inline;
}

.message-metadata {
  display: inline;
}

span.metadata.danger,
i.fa.fa-trash-o.danger,
sp-moment.danger {
  font-weight: normal !important;
}

.btn-toolbar {
  padding: 12px 0 0;
  margin-left: 0;
}

div.btn-toolbar.message-toolbar {
  margin-bottom: 20px;
}
.btn-toolbar {
  padding: 12px 0 0;
  margin-left: 0;
}

button img {
  position: relative;
  top: -1px;
  width: 17px;
}

.btn-toolbar > .btn,
.btn-toolbar > .btn-group,
.btn-toolbar > .input-group,
.action-btns .btn {
  margin-left: 0;
  margin-right: 5px;
}

.btn-default.disabled:hover,
.btn-default[disabled]:hover,
fieldset[disabled] .btn-default:hover,
.btn-default.disabled:focus,
.btn-default[disabled]:focus,
fieldset[disabled] .btn-default:focus,
.btn-default.disabled.focus,
.btn-default[disabled].focus,
fieldset[disabled] .btn-default.focus {
  background-color: #fff;
  border-color: #ccc;
}

.btn-default:active:hover,
.btn-default.active:hover,
.open > .dropdown-toggle.btn-default:hover,
.btn-default:active:focus,
.btn-default.active:focus,
.open > .dropdown-toggle.btn-default:focus,
.btn-default:active.focus,
.btn-default.active.focus,
.open > .dropdown-toggle.btn-default.focus {
  color: #333;
  border-color: #8c8c8c;
}

.btn:focus,
.btn:active:focus,
.btn.active:focus,
.btn.focus,
.btn:active.focus,
.btn.active.focus {
  outline: 5px auto -webkit-focus-ring-color;
  outline-offset: -2px;
}

.btn-default:active,
.btn-default.active,
.open > .dropdown-toggle.btn-default {
  color: #333;
  background-color: #e6e6e6;
  background-image: none;
  border-color: #adadad;
}

.btn-default:hover {
  color: #333;
  background-color: #e6e6e6;
  border-color: #adadad;
}

.btn-default:focus,
.btn-default.focus {
  color: #333;
  background-color: #e6e6e6;
  border-color: #8c8c8c;
}

.btn.disabled,
.btn[disabled],
fieldset[disabled] .btn {
  cursor: not-allowed;
  pointer-events: unset;
  border-color: #adadad;
  background-color: #fff;
  filter: alpha(opacity=65);
  opacity: 0.65;
  -webkit-box-shadow: none;
  box-shadow: none;
}

.btn:active,
.btn.active {
  background-image: none;
  outline: 0;
  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
}

.btn:hover,
.btn:focus,
.btn.focus {
  color: #333;
  text-decoration: none;
}

a:focus,
button:focus {
  outline: 0 !important;
}

button[disabled],
html input[disabled] {
  cursor: default;
}

.btn-default {
  padding: 8px 16px;
}

.btn-default {
  color: #333;
  background-color: #fff;
  border-color: #ccc;
}

span.metadata {
  display: inline-block;
  padding: 0px 20px 2px 0;
  color: #777f7f;
}

code,
kbd,
pre,
samp {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
}

pre {
  margin: 3px 0 2px;
}
pre {
  white-space: pre-wrap;
}
pre {
  display: block;
  padding: 9.5px;
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.42857143;
  color: #333333;
  word-break: break-all;
  word-wrap: break-word;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.msg-tabs {
  margin-bottom: 20px;
}

/* .label-warning,
.badge-warning {
    background-color: #aa6708;
    background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0%, hsl(35, 95%, 76%)), color-stop(100%, hsl(35, 95%, 61%)));
    background-image: -webkit-linear-gradient(top, hsl(35, 95%, 76%), hsl(35, 95%, 61%));
    background-image: -moz-linear-gradient(top, hsl(35, 95%, 76%), hsl(35, 95%, 61%));
    background-image: -ms-linear-gradient(top, hsl(35, 95%, 76%), hsl(35, 95%, 61%));
    background-image: -o-linear-gradient(top, hsl(35, 95%, 76%), hsl(35, 95%, 61%));
    background-image: linear-gradient(top, hsl(35, 95%, 76%), hsl(35, 95%, 61%));
    border-color: #aa6708;
} */

/* body {
    background-color: #e9eaed;
    color: #181919;
    overflow-y: scroll;
    padding-top: 100px;
    padding-bottom: 100px;
} */
</style>
