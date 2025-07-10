<script setup lang="ts">
import routeLinks from "@/router/routeLinks";
import Message, { MessageStatus } from "@/resources/Message";
import { defineProps } from "vue";
import { formatDotNetTimespan } from "@/composables/formatUtils";
import { useRoute, useRouter } from "vue-router";
import MessageStatusIcon from "@/components/audit/MessageStatusIcon.vue";

const route = useRoute();
const router = useRouter();

const props = defineProps<{
  message: Message;
}>();

function getMessageUrl(message: Message) {
  const path = message.status === MessageStatus.Successful || message.status === MessageStatus.ResolvedSuccessfully ? routeLinks.messages.successMessage.link(message.message_id, message.id) : routeLinks.messages.failedMessage.link(message.id);

  // Build the complete URL with hash routing and query parameters
  const query = router.currentRoute.value.query;
  const queryParams = new URLSearchParams();

  // Add existing query parameters
  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  // Add the back parameter
  queryParams.set("back", route.path);

  const queryString = queryParams.toString();
  return `#${path}${queryString ? `?${queryString}` : ""}`;
}

function navigateToMessage(message: Message, event?: MouseEvent) {
  // Allow browser's native tab/window opening behavior
  if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1)) {
    return;
  }

  // For normal left-clicks, prevent default anchor behavior and use Vue Router
  // This maintains SPA navigation and preserves the "back" query parameter
  if (event) {
    event.preventDefault();
  }

  const query = router.currentRoute.value.query;
  const path = message.status === MessageStatus.Successful || message.status === MessageStatus.ResolvedSuccessfully ? routeLinks.messages.successMessage.link(message.message_id, message.id) : routeLinks.messages.failedMessage.link(message.id);

  router.push({
    path,
    query: { ...query, ...{ back: route.path } },
  });
}
</script>

<template>
  <a class="item" :href="getMessageUrl(props.message)" @click="navigateToMessage(props.message, $event)">
    <div class="status">
      <MessageStatusIcon :message="props.message" />
    </div>
    <div class="message-id">{{ props.message.message_id }}</div>
    <div class="message-type">{{ props.message.message_type }}</div>
    <div class="time-sent"><span class="label-name">Time Sent:</span>{{ new Date(props.message.time_sent).toLocaleString() }}</div>
    <div class="critical-time"><span class="label-name">Critical Time:</span>{{ formatDotNetTimespan(props.message.critical_time) }}</div>
    <div class="processing-time"><span class="label-name">Processing Time:</span>{{ formatDotNetTimespan(props.message.processing_time) }}</div>
    <div class="delivery-time"><span class="label-name">Delivery Time:</span>{{ formatDotNetTimespan(props.message.delivery_time) }}</div>
  </a>
</template>

<style scoped>
.item {
  padding: 0.3rem 0.2rem;
  border: 1px solid #ffffff;
  border-bottom: 1px solid #eee;
  display: grid;
  grid-template-columns: 1.8em 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.375rem;
  grid-template-areas:
    "status message-type message-type message-type time-sent"
    "status message-id processing-time critical-time delivery-time";
  text-decoration: none;
  color: inherit;
}
.item:not(:first-child) {
  border-top-color: #eee;
}
.item:hover {
  border-color: var(--sp-blue);
  background-color: #edf6f7;
  cursor: pointer;
}
.label-name {
  margin-right: 0.25rem;
  color: #777f7f;
}
.status {
  grid-area: status;
}
.message-id {
  grid-area: message-id;
}
.time-sent {
  grid-area: time-sent;
}
.message-type {
  grid-area: message-type;
  font-weight: bold;
  overflow-wrap: break-word;
}
.processing-time {
  grid-area: processing-time;
}
.critical-time {
  grid-area: critical-time;
}
.delivery-time {
  grid-area: delivery-time;
}
</style>
