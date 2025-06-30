<script setup lang="ts">
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

defineProps<{ icon: IconDefinition; title?: string }>();
</script>

<template>
  <span class="faIcon" :title="title"><FontAwesomeIcon :icon="icon" /></span>
</template>

<style scoped>
.faIcon {
  margin: 0 !important;
  color: #929e9e;
}
</style>
