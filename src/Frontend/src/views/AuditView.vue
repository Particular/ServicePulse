<script setup lang="ts">
import { licenseStatus } from "../composables/serviceLicense";
import LicenseExpired from "../components/LicenseExpired.vue";
import AuditList from "@/components/audit/AuditList.vue";
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <h1>Audit Messages</h1>
        </div>
      </div>
      <div class="row">
        <AuditList />
      </div>
    </div>
  </template>
</template>
