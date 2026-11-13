<script setup lang="ts">
import { faComment } from "@fortawesome/free-solid-svg-icons";
import FAIcon from "@/components/FAIcon.vue";
import ExternalLink from "@/components/ExternalLink.vue";
</script>

<template>
  <ExternalLink href="https://github.com/Particular/ServicePulse/issues/new">
    <FAIcon :icon="faComment" />
    <span class="side-bar-label">Feedback</span>
  </ExternalLink>
</template>
