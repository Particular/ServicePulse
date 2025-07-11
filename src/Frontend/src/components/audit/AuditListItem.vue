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

function getMessageRoute(message: Message) {
  const path = message.status === MessageStatus.Successful || message.status === MessageStatus.ResolvedSuccessfully ? routeLinks.messages.successMessage.link(message.message_id, message.id) : routeLinks.messages.failedMessage.link(message.id);

  const query = router.currentRoute.value.query;
  return {
    path,
    query: { ...query, back: route.path },
  };
}
</script>

<template>
  <RouterLink :to="getMessageRoute(props.message)" class="item">
    <span class="status">
      <MessageStatusIcon :message="props.message" />
    </span>
    <span class="message-id">{{ props.message.message_id }}</span>
    <span class="message-type">{{ props.message.message_type }}</span>
    <span class="time-sent"><span class="label-name">Time Sent:</span>{{ new Date(props.message.time_sent).toLocaleString() }}</span>
    <span class="critical-time"><span class="label-name">Critical Time:</span>{{ formatDotNetTimespan(props.message.critical_time) }}</span>
    <span class="processing-time"><span class="label-name">Processing Time:</span>{{ formatDotNetTimespan(props.message.processing_time) }}</span>
    <span class="delivery-time"><span class="label-name">Delivery Time:</span>{{ formatDotNetTimespan(props.message.delivery_time) }}</span>
  </RouterLink>
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
  display: block;
}
.message-id {
  grid-area: message-id;
  display: block;
}
.time-sent {
  grid-area: time-sent;
  display: block;
}
.message-type {
  grid-area: message-type;
  font-weight: bold;
  overflow-wrap: break-word;
  display: block;
}
.processing-time {
  grid-area: processing-time;
  display: block;
}
.critical-time {
  grid-area: critical-time;
  display: block;
}
.delivery-time {
  grid-area: delivery-time;
  display: block;
}
</style>
