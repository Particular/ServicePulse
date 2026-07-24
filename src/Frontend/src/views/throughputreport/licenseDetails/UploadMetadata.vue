<script setup lang="ts">
import ActionButton from "@/components/ActionButton.vue";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { computed, ref } from "vue";

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
    // eslint-disable-next-line no-console
    console.error(e);
    uploadError.value = true;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="box">
    <span>Once you have an endpoint metadata file from Particular, upload it into ServiceControl here:</span>
    <div class="alert alert-danger" role="alert" v-if="uploadError">Upload Failed!</div>
    <form method="post" enctype="multipart/form-data" @submit.prevent="handleSubmit">
      <div>
        <input id="file-upload" type="file" class="form-control" accept=".plm" :onchange="enableUploadFile" :disabled="saving" />
      </div>
      <div class="mt-3">
        <ActionButton variant="secondary" type="submit" id="submit-upload-files" :loading="saving" :disabled="!canUpload">Upload File</ActionButton>
      </div>
    </form>
  </div>
</template>
