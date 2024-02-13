<script setup lang="ts">
import { RouterView } from "vue-router";
import PageFooter from "./components/PageFooter.vue";
import PageHeader from "./components/PageHeader.vue";
import { useServiceControlUrls } from "./composables/serviceServiceControlUrls";
import { useServiceControl, useServiceControlVersion } from "./composables/serviceServiceControl";
import { useLicense } from "./composables/serviceLicense";
import "bootstrap";

useServiceControlUrls();
useServiceControl();
useServiceControlVersion();
useLicense();
</script>

<template>
  <page-header />
  <div class="container-fluid" id="main-content">
    <RouterView />
  </div>
  <page-footer />
</template>
