<script setup lang="ts">
import { onMounted, ref } from "vue";
import ReportGenerationState from "@/resources/ReportGenerationState";
import throughputClient from "@/views/throughputreport/throughputClient";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";
import ServiceControlAvailable from "@/components/ServiceControlAvailable.vue";
import ThroughputSupported from "@/views/throughputreport/ThroughputSupported.vue";

const reportState = ref<ReportGenerationState | null>(null);

onMounted(async () => {
  reportState.value = await throughputClient.reportAvailable();
});

async function generateReport() {
  const results = await throughputClient.endpoints();
  const found = results.find((value) => !value.user_indicator);

  if (found) {
    const answer = window.confirm("Not all endpoints/queues have an Endpoint Type set. Are you sure you want to continue?");
    // cancel the navigation and stay on the same page
    if (!answer) {
      return false;
    }
  }

  const fileName = await throughputClient.downloadReport();

  if (fileName !== "") {
    useShowToast(TYPE.INFO, "Report Generated", `Please email '${fileName}' to your account manager`, true);
  }
}
</script>

<template>
  <ServiceControlAvailable>
    <ThroughputSupported>
      <div class="container">
        <div class="row">
          <div class="col-sm-6">
            <h1>Throughput</h1>
          </div>
          <div class="col-sm-6 text-end">
            <span class="reason" v-if="!reportState?.report_can_be_generated">{{ reportState?.reason }}</span>
            <button type="button" class="btn btn-primary actions" @click="generateReport()" :disabled="!reportState?.report_can_be_generated"><i class="fa fa-download"></i> Generate Report</button>
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