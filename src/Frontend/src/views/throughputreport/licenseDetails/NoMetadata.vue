<script setup lang="ts">
import CapabilityCard from "@/components/platformcapabilities/CapabilityCard.vue";
import { Capability, CapabilityStatus } from "@/components/platformcapabilities/constants";
import UploadMetadata from "./UploadMetadata.vue";

defineProps<{ metadataError?: string | null }>();
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
    <UploadMetadata />
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
