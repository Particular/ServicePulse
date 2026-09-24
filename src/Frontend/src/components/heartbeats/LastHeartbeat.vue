<script setup lang="ts">
import TimeSince from "@/components/TimeSince.vue";
import { Tippy } from "vue-tippy";
import ExternalLink from "@/components/ExternalLink.vue";

defineProps<{ date?: string; tooltipTarget: string }>();
</script>

<template>
  <p v-if="date"><time-since :date-utc="date" default-text-on-failure="unknown" title-value="Last Heartbeat" /></p>
  <p v-else>
    <tippy :delay="[1000, 300]" :interactive="true">
      <template #content>
        <p>No heartbeat data received for this {{ tooltipTarget }}.</p>
        <p>Have you installed and configured the <ExternalLink href="https://docs.particular.net/monitoring/heartbeats/install-plugin">heartbeats plugin</ExternalLink> for this {{ tooltipTarget }}?</p>
      </template>
      <span>No data available</span>
    </tippy>
  </p>
</template>
