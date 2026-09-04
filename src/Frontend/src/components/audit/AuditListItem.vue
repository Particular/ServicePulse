<script setup lang="ts">
import routeLinks from "@/router/routeLinks";
import { type default as Message, MessageStatus } from "@/resources/Message";
import { computed } from "vue";
import { formatDotNetTimespan } from "@/composables/formatUtils";
import { useRouter, RouterLink } from "vue-router";
import MessageStatusIcon from "@/components/audit/MessageStatusIcon.vue";
import AdaptiveTimestamp from "@/components/AdaptiveTimestamp.vue";

const router = useRouter();

const props = defineProps<{
  message: Message;
}>();
const link = computed(() => {
  const query = router.currentRoute.value.query;

  const route = router.resolve({
    path:
      props.message.status === MessageStatus.Successful || props.message.status === MessageStatus.ResolvedSuccessfully
        ? routeLinks.messages.successMessage.link(props.message.message_id, props.message.id)
        : routeLinks.messages.failedMessage.link(props.message.id),
    query: { ...query, ...{ back: router.currentRoute.value.path } },
  });

  return route;
});
</script>

<template>
  <RouterLink class="item" :to="link">
    <div class="status">
      <MessageStatusIcon :message="props.message" />
    </div>
    <div class="message-id">{{ props.message.message_id }}</div>
    <div class="message-type">{{ props.message.message_type }}</div>
    <div class="time-sent">
      <span class="label-name">Time Sent:</span><AdaptiveTimestamp :date-utc="props.message.time_sent" part="absolute" /><span class="age d-none d-lg-inline"> · <AdaptiveTimestamp :date-utc="props.message.time_sent" part="relative" /></span>
    </div>
    <div class="critical-time"><span class="label-name">Critical Time:</span>{{ formatDotNetTimespan(props.message.critical_time) }}</div>
    <div class="processing-time"><span class="label-name">Processing Time:</span>{{ formatDotNetTimespan(props.message.processing_time) }}</div>
    <div class="delivery-time"><span class="label-name">Delivery Time:</span>{{ formatDotNetTimespan(props.message.delivery_time) }}</div>
  </RouterLink>
</template>

<style scoped>
/* A row is a two-line card that is also a link.
 *
 * Its columns are NOT its own. The list (AuditList.vue) declares the six columns once and
 * every row joins them with `subgrid`, so a value in one row sits exactly under the same
 * value in the next: the widest "Time Sent" in the list sets that column for all rows.
 * A row that sized its own columns could only measure its own values, and rows would
 * drift apart (or wrap) as soon as one of them held a longer value.
 *
 *   grid-column: 1 / -1            span all six columns of the list
 *   grid-template-columns: subgrid use them as this row's columns
 *   grid-template-areas            where each cell goes, by name: the message type owns
 *                                  the top line, the id and the values share the bottom
 *                                  line, the status icon spans both */
.item {
  color: inherit;
  text-decoration: none;
  padding: 0.3rem 0.2rem;
  border: 1px solid #ffffff;
  border-bottom: 1px solid #eee;
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  grid-template-rows: auto auto;
  gap: 0.375rem;
  grid-template-areas:
    "status message-type message-type message-type message-type message-type"
    "status message-id processing-time critical-time delivery-time time-sent";
}
.item:not(:first-child) {
  border-top-color: #eee;
}
.item:hover {
  border-color: var(--sp-blue);
  background-color: #edf6f7;
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

/* The age reads as a footnote to the timestamp it follows. It is the first thing to go
   when width gets tight: hidden below Bootstrap's lg breakpoint (d-none d-lg-inline on
   the span), the absolute timestamp carries the information */
.age,
.age :deep(.relative) {
  color: #777f7f;
}

/* All data cells share the bottom line; when one wraps taller, the rest stay
   bottom aligned with it */
.message-id,
.processing-time,
.critical-time,
.delivery-time,
.time-sent {
  align-self: end;
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
