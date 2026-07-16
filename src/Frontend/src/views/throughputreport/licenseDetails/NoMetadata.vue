<script setup lang="ts">
import ActionButton from "@/components/ActionButton.vue";
import CapabilityCard from "@/components/platformcapabilities/CapabilityCard.vue";
import { Capability, CapabilityStatus } from "@/components/platformcapabilities/constants";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { computed, ref } from "vue";

defineProps<{ metadataError?: string | null }>();

const licenseDetailsStore = useLicenseDetailsStore();

const file = ref<File>();
const canUpload = computed(() => file.value);
function enableUploadFile(event: Event) {
  file.value = ((event.target as HTMLInputElement)?.files ?? [])[0];
}

const saving = ref(false);
const uploadError = ref(false);
async function handleSubmit() {
  if (!file.value) return;

  uploadError.value = false;
  saving.value = true;
  try {
    await licenseDetailsStore.uploadEndpointMetadata(file.value);
  } catch (e) {
    console.error(e);
    uploadError.value = true;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="no-metadata mt-2">
    <div v-if="metadataError" class="alert alert-danger">{{ metadataError }}</div>
    <CapabilityCard
      :title="Capability.LicensedEndpointTracking"
      subtitle="Track throughput against licensed endpoints"
      :status="CapabilityStatus.InstanceNotConfigured"
      description="Depending on your system setup, it is possible to track current usage and maintain queues associated with licensed endpoints. This can assist when determining renewal costs, and also assists Particular with determining the correct processing of your usage report. This functionality requires an endpoint metadata file which is linked to your license and, if available for your system, can be downloaded from the customer portal to be uploaded into ServiceControl here."
      help-button-text="Customer Portal"
      help-button-url="https://customers.particular.net"
      :allow-dismiss="false"
    />
    <div class="box">
      <span>Once you have an endpoint metadata file from Particular, upload it into ServiceControl here:</span>
      <div class="alert alert-danger" role="alert" v-if="uploadError">Upload Failed!</div>
      <form method="post" enctype="multipart/form-data" @submit.prevent="handleSubmit">
        <div>
          <input id="file-upload" type="file" class="form-control" accept=".plm" :onchange="enableUploadFile" :disabled="saving" />
        </div>
        <div class="mt-3">
          <ActionButton class="btn btn-outline-secondary" type="submit" id="submit-upload-files" :loading="saving" :disabled="!canUpload">Upload File</ActionButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.no-metadata {
  max-width: 80em;
  color: #666;
}

.alert {
  font-size: 0.8rem;
}
</style>
