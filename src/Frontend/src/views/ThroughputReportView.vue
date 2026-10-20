<script setup lang="ts">
import { ref } from "vue";
import createThroughputClient from "@/views/throughputreport/throughputClient";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";
import ServiceControlAvailable from "@/components/ServiceControlAvailable.vue";
import ThroughputSupported from "@/views/throughputreport/ThroughputSupported.vue";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { computedAsync } from "@vueuse/core";
import useIsThroughputSupported from "./throughputreport/isThroughputSupported";
import ActionButton from "@/components/ActionButton.vue";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { storeToRefs } from "pinia";
import ModalDialog from "@/components/ModalDialog.vue";

const isThroughputSupported = useIsThroughputSupported();
const throughputClient = createThroughputClient();
const licenseDetailsStore = useLicenseDetailsStore();
const { hasLicenseDetails, hasAmendments, unassignedQueues } = storeToRefs(licenseDetailsStore);

const reportState = computedAsync(async () => (isThroughputSupported.value ? await throughputClient.reportAvailable() : null), null);
const reportWarnings = ref<string[]>([]);
const generating = ref(false);

async function generateReport() {
  generating.value = true;
  try {
    const results = await throughputClient.queues();
    const hasNonUserIndicatorEndpoint = results.find((value) => !value.user_indicator);

    if (hasNonUserIndicatorEndpoint) reportWarnings.value.push("Not all endpoints/queues have an Endpoint Type set.");
    if (hasLicenseDetails.value && unassignedQueues.value.length > 0) {
      if (hasAmendments.value)
        reportWarnings.value.push("Amendments have been made to the license details, but some queues remain unassigned. Amending the license details to fully represent your current system will assist with expediting your license renewal.");
      else reportWarnings.value.push("Some queues remain unassigned on the license details tab. Amending the license details to fully represent your current system will assist with expediting your license renewal.");
    }
    if (!reportWarnings.value.length) {
      await downloadReport();
    }
  } finally {
    generating.value = false;
  }
}

async function downloadReport() {
  generating.value = true;
  reportWarnings.value = [];
  try {
    const fileName = await throughputClient.downloadReport();

    if (fileName !== "") {
      useShowToast(TYPE.INFO, "Report Downloaded", `Please email '${fileName}' to your Particular account manager.`, true);
    }
  } finally {
    generating.value = false;
  }
}
</script>

<template>
  <ServiceControlAvailable>
    <ThroughputSupported>
      <div class="container">
        <div class="row">
          <div class="col-sm-6">
            <h1>Usage</h1>
          </div>
          <div class="col-sm-6 text-end">
            <span class="reason" v-if="!reportState?.report_can_be_generated">{{ reportState?.reason }}</span>
            <ActionButton aria-label="Download Report" variant="primary" class="action" @click="generateReport()" :disabled="generating || !reportState?.report_can_be_generated" :icon="faDownload" :loading="generating">Download Report</ActionButton>
            <Teleport to="#modalDisplay">
              <ModalDialog v-if="reportWarnings.length" id="download-report" title="Download Report" @close="reportWarnings = []" @confirm="downloadReport">
                <template #modalBody>
                  <ul>
                    <li v-for="warning in reportWarnings" :key="warning">
                      {{ warning }}
                    </li>
                  </ul>
                  <p>Are you sure you want to continue?</p>
                </template>
                <template #modalFooter>
                  <ActionButton variant="primary" aria-label="Yes" @click="downloadReport">Yes</ActionButton>
                  <ActionButton aria-label="No" @click="reportWarnings = []">No</ActionButton>
                </template>
              </ModalDialog>
            </Teleport>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
            <RouterView />
          </div>
        </div>
      </div>
    </ThroughputSupported>
  </ServiceControlAvailable>
</template>

<style scoped>
.reason {
  margin-left: 5px;
  margin-right: 5px;
}
</style>
