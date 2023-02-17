<script setup>
import { ref, computed, watch, onMounted, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { connectionState } from "../composables/serviceServiceControl";
import { useFetchFromServiceControl } from "../composables/serviceServiceControlUrls";
import stackTrace from "../components/message/StackTrace.vue";
import NoData from "../components/NoData.vue";
import TimeSince from "../components/TimeSince.vue";

const route = useRoute();
const id = route.params.id;
const messageErrorDetails = ref([]);
const fetchError = ref({
    error: false,
});

const routes = {
    path: "/failed-messages/message/:id",
    "stack-trace": { component: stackTrace, title: "Stack Trace" },
};

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

onBeforeMount(() => {
    getMessageErrorDetails();
})

onMounted(() => {
  getMessageErrorDetails();
});
</script>

<template>
    <no-data
        v-if="fetchError.error"
        title="message failures"
        message="Could not find message. This could be because the message URL is invalid or the corresponding message was processed and is no longer tracked by ServiceControl."
    ></no-data>
    <div v-show="!fetchError.error" class="container">
        <div class="row">
            <div class="col-sm-12">   
                <div class="active break group-title">
                    <h1 class="message-type-title">{{ messageErrorDetails.message_type }}</h1>
                </div>        
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12">
                <div class="metadata group-title group-message-count message-metadata">
                    <span v-if="messageErrorDetails.number_of_processing_attempts > 1" tooltip="This message has already failed {{messageErrorDetails.number_of_processing_attempts}} times" class="label sidebar-label label-important metadata-label">{{messageErrorDetails.number_of_processing_attempts}} Retry Failures</span>
                    <span class="metadata"><i class="fa fa-clock-o"></i> Failed: <time-since :date-utc="messageErrorDetails.time_of_failure"></time-since></span>
                    <span class="metadata"><i class="fa pa-endpoint"></i> Endpoint: {{ messageErrorDetails.receiving_endpoint.name }}</span>
                    <span class="metadata"><i class="fa fa-laptop"></i> Machine: {{ messageErrorDetails.receiving_endpoint.host }}</span>
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
                {{ messageErrorDetails }}
            </div>
        </div>
        <component :is="currentView" v-on="currentEvents" />
    </div>
</template>

<style></style>
