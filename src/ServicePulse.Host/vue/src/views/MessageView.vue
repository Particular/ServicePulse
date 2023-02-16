<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { connectionState } from "../composables/serviceServiceControl";
import stackTrace from "../components/message/StackTrace.vue";
import { useFetchFromServiceControl } from "../composables/serviceServiceControlUrls";

const route = useRoute();
const id = route.params.id;

const routes = [
  {
    path: "/failed-messages/message/:id",
  },
  {
    "stack-trace": { component: stackTrace, title: "Stack Trace" },
  },
];

const messageErrorDetails = ref([]);

function getMessageErrorDetails() {
  return useFetchFromServiceControl("errors/last/" + id)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      messageErrorDetails.value = [];
      messageErrorDetails.value = data;
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
      " - Configuration � ServicePulse";
  }
});

onMounted(() => {
  getMessageErrorDetails();
  const path = currentPath.value.slice(1) || "/";
  if (
    path === "/" &&
    !connectionState.connected &&
    !connectionState.connectedRecently
  ) {
    /* empty */
  }
});
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-12">
        <h1>{{ messageErrorDetails.message_type }}</h1>
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
            <a href="#stack-trace"
              >Stack Trace {{ messageErrorDetails }}</a
            >
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
    <component :is="currentView" v-on="currentEvents" />
  </div>
</template>

<style></style>
