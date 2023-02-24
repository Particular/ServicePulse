<script setup>
import TimeSince from "../TimeSince.vue";

let lastLabelClickedIndex = undefined;
const emit = defineEmits(["retryRequested"]);
const props = defineProps({
  messages: Array,
});

function getSelectedMessages() {
  return props.messages.filter((m) => m.selected);
}

function selectAll() {
  props.messages.forEach((m) => (m.selected = true));
}

function deselectAll() {
  props.messages.forEach((m) => (m.selected = false));
}

function isAnythingSelected() {
  return props.messages.find((m) => m.selected);
}

function labelClicked($event, index) {
  if ($event.shiftKey && typeof lastLabelClickedIndex !== "undefined") {
    // toggle selection from lastLabel until current index
    const start = (index < lastLabelClickedIndex ? index : lastLabelClickedIndex) + 1;
    const end = (index < lastLabelClickedIndex ? lastLabelClickedIndex : index) + 1;

    for (let x = start; x < end; x++) {
      props.messages[x].selected = !props.messages[x].selected;
    }

    clearSelection();
  } else {
    lastLabelClickedIndex = index;
  }
}

function clearSelection() {
  if(document.selection && document.selection.empty) {
    document.selection.empty();
  } else if(window.getSelection) {
    var sel = window.getSelection();
    sel.removeAllRanges();
  }
}

defineExpose({
  getSelectedMessages,
  selectAll,
  deselectAll,
  isAnythingSelected,
});
</script>

<template>
  <div v-for="(message, index) in props.messages" class="row box repeat-item failed-message" :key="message.id">
    <label class="check col-1" :for="`checkbox${message.id}`" @click="labelClicked($event, index)">
      <input type="checkbox" :disabled="message.retryInProgress" class="checkbox" v-model="message.selected" :value="message.id" :id="`checkbox${message.id}`" />
    </label>
    <div class="col-11 failed-message-data">
      <div class="row">
        <div class="col-12">
          <div class="row box-header">
            <div class="col-12 no-side-padding">
              <p class="lead break">{{ message.message_type || "Message Type Unknown - missing metadata EnclosedMessageTypes" }}</p>
              <p class="metadata">
                <span v-if="message.retried || message.retryInProgress" tooltip="Message is being retried" class="label sidebar-label label-info metadata-label metadata"><i class="bi-arrow-clockwise"></i> Retry in progress</span>
                <span v-if="message.archived" tooltip="Message is being deleted" class="label sidebar-label label-warning metadata-label">Deleted</span>
                <span v-if="message.number_of_processing_attempts > 1" tooltip="This message has already failed {{message.number_of_processing_attempts}} times" class="label sidebar-label label-important metadata-label">{{ message.number_of_processing_attempts }} Retry Failures</span>
                <span v-if="message.edited" tooltip="Message was edited" class="label sidebar-label label-info metadata-label">Edited</span>

                <span class="metadata"><i class="fa fa-clock-o"></i> Failed: <time-since :dateUtc="message.time_of_failure"></time-since></span>
                <span class="metadata"><i class="fa pa-endpoint"></i> Endpoint: {{ message.receiving_endpoint.name }}</span>
                <span class="metadata"><i class="fa fa-laptop"></i> Machine: {{ message.receiving_endpoint.host }}</span>
                <span class="metadata" v-if="message.redirect"><i class="fa pa-redirect-source pa-redirect-small"></i> Redirect: {{ message.redirect }}</span>
                <button type="button" v-if="!message.retryInProgress" class="btn btn-link btn-sm" @click="emit('retryRequested', message.id)"><i aria-hidden="true" class="fa fa-repeat no-link-underline">&nbsp;</i>Request retry</button>
              </p>

              <pre class="stacktrace-preview" isolate-click>{{ message.exception.message }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.stacktrace-preview {
  height: 38px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.check:hover,
.failed-message-data:hover {
  background-color: #edf6f7;
}

.failed-message:hover {
  border: 1px solid #00a3c4;
}

.repeat-item {
  padding: 0 !important;
}

.check,
div.failed-message-data {
  padding-top: 15px;
  padding-left: 25px;
  padding-bottom: 0;
}

.box p {
  color: #777f7f;
  font-size: 14px;
  margin-bottom: 0;
}

.pa-endpoint {
  position: relative;
  top: 3px;
  background-image: url("@/assets/endpoint.svg");
  background-position: center;
  background-repeat: no-repeat;
  height: 15px;
  width: 15px;
}

.checkbox {
  margin-top: 1px;
  margin-left: 1px;
  width: 16px;
  height: 16px;
  border: 1px solid #929e9e;
  background-color: #fff;
}

.checkbox:hover,
.check-hover {
  margin-top: 0;
  margin-left: 0;
  width: 18px;
  height: 18px;
  border: 2px solid #00a3c4;
}

label:after .checkbox {
  opacity: 0;
  content: "";
  position: absolute;
  width: 11px;
  height: 7px;
  background: transparent;
  top: 2px;
  left: 2px;
  border: 3px solid #333;
  border-top: none;
  border-right: none;
  transform: rotate(-45deg);
}

.checkbox input[type="checkbox"]:checked + label:after {
  opacity: 1;
}

p.metadata {
  margin-bottom: 6px;
  position: relative;
}

p.metadata button {
  position: absolute;
  right: 0px;
  top: 0;
}

.metadata > .btn-sm {
  color: #00a3c4;
  font-size: 14px;
  font-weight: bold;
  padding: 0 36px 10px 0;
  text-decoration: none;
  display: none;
}

.failed-message:hover .metadata > .btn-sm {
  display: block;
}

.metadata > .btn-sm > i {
  color: #00a3c4;
}

.metadata:first-child {
  padding-left: 0;
}

span.metadata {
  display: inline-block;
  padding: 0px 20px 2px 0;
  color: #777f7f;
}
</style>
