<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import PageBanner, { type BannerMessage } from "@/components/PageBanner.vue";
import useEnvironmentAndVersionsAutoRefresh from "@/composables/useEnvironmentAndVersionsAutoRefresh";
import usePlatformModelAutoRefresh from "@/composables/usePlatformModelAutoRefresh";

const DISMISSED_STORAGE_KEY = "servicepulse-v7-storage-banner-dismissed";
const minimumSCVersionForStorageOptions = "7.0.0";
const learnMoreUrl = "https://docs.particular.net/servicecontrol/storage";

const { store: environmentStore } = useEnvironmentAndVersionsAutoRefresh();
const isStorageOptionsSupported = environmentStore.serviceControlIsGreaterThan(minimumSCVersionForStorageOptions);
const { store: platformModelStore } = usePlatformModelAutoRefresh();
const { model, primary } = storeToRefs(platformModelStore);

// An error instance that doesn't report a storage type predates the storage options, so RavenDB is the only thing it can be on
const errorInstanceUsesRavenDB = computed(() => /raven/i.test(primary.value?.storageType ?? "RavenDB"));

function loadDismissed() {
  try {
    return localStorage.getItem(DISMISSED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

const dismissed = ref(loadDismissed());

function dismiss() {
  dismissed.value = true;
  try {
    localStorage.setItem(DISMISSED_STORAGE_KEY, "true");
  } catch {
    // Ignore storage errors
  }
}

const isVisible = computed(() => !dismissed.value && isStorageOptionsSupported.value && model.value !== null && errorInstanceUsesRavenDB.value);

const message: BannerMessage = {
  title: "ServiceControl supports new storage options",
  description: "With the upgrade to v7, ServiceControl now supports Microsoft SQL Server and PostgreSQL providing better performance and more flexibility for cloud deployments.",
};
</script>

<template>
  <PageBanner v-if="isVisible" class="storage-options-banner" :message="message" show-action action-label="See storage options" :action-url="learnMoreUrl" dismissible @dismiss="dismiss" />
</template>

<style scoped>
.storage-options-banner {
  margin-bottom: 1rem;
}
</style>
