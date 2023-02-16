<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { connectionState } from "../composables/serviceServiceControl";
import stackTrace from "../components/message/StackTrace.vue";

const routes = [{
  path: '/failed-messages/message/:messageId',
  "stack-trace": { component: stackTrace, title: "Stack Trace" },
}];

const currentPath = ref(window.location.hash);
//const redirectCount = ref(0);
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
  // setupEvents(newValue);
  if (routes[currentPath.value.slice(1) || "/"]) {
    document.title =
      routes[currentPath.value.slice(1) || "/"].title +
      " - Configuration � ServicePulse";
  }
});

onMounted(() => {
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
        <h1>{Msg 1} {{ $route.params.messageId }}</h1>
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
    <component :is="currentView" v-on="currentEvents" />
  </div>
</template>

<style></style>
