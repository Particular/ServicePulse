<script setup lang="ts">
import { RouterLink } from "vue-router";
import routeLinks from "@/router/routeLinks";
import FAIcon from "@/components/FAIcon.vue";
import { faListUl } from "@fortawesome/free-solid-svg-icons";
</script>

<template>
  <RouterLink :to="routeLinks.events">
    <FAIcon :icon="faListUl" />
    <span class="side-bar-label">Events</span>
  </RouterLink>
</template>
