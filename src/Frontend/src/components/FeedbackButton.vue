<script setup lang="ts">
import { faComment } from "@fortawesome/free-solid-svg-icons";
import FAIcon from "./FAIcon.vue";
</script>

<template>
  <a class="btn-feedback" href="https://github.com/Particular/ServicePulse/issues/new" target="_blank">
    <FAIcon class="white" :icon="faComment" title="Feedback" />
    <span class="navbar-label">Feedback</span>
  </a>
</template>
<style scoped>
@import "@/assets/navbar.css";
@import "@/assets/header-menu-item.css";

.white {
  color: #fff;
}
</style>
