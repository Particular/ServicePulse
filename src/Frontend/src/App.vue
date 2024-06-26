<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView, useRouter } from "vue-router";
import PageFooter from "./components/PageFooter.vue";
import PageHeader from "./components/PageHeader.vue";
import "bootstrap";
import { useServiceControlUrls } from "@/composables/serviceServiceControlUrls";
import "highlight.js/styles/github-dark.css";
import { useServiceControl } from "@/composables/serviceServiceControl";
import LicenseNotifications from "./components/LicenseNotifications.vue";

useServiceControlUrls();

onMounted(async () => {
  const router = useRouter();
  await useServiceControl(router);
});
</script>

<template>
  <page-header />
  <div class="container-fluid" id="main-content">
    <RouterView />
  </div>
  <LicenseNotifications />
  <page-footer />
</template>
