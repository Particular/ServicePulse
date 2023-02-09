<script setup>
import LicenseExpired from "../components/LicenseExpired.vue";
import ServiceControlNotAvailable from "../components/ServiceControlNotAvailable.vue";
import { licenseStatus } from "./../composables/serviceLicense.js";
</script>

<template>
    <LicenseExpired />
    <template v-if="!licenseStatus.isExpired">
      <div class="container">
        <ServiceControlNotAvailable />
  
        Failed Messages Vue
      </div>
    </template>
  </template>