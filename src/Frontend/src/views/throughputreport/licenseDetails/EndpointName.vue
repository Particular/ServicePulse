<script setup lang="ts">
import ActionButton from "@/components/ActionButton.vue";
import ModalDialog from "@/components/ModalDialog.vue";
import type { Endpoint } from "@/resources/LicenseDetails";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";

const licenseDetailsStore = useLicenseDetailsStore();
const { endpoints } = storeToRefs(licenseDetailsStore);

const emit = defineEmits(["close", "save"]);
const props = defineProps<{ endpoint: Endpoint }>();

const endpointName = ref(props.endpoint.name);
const error = ref<string | null>(null);
const currentLength = computed(() => endpointName.value.length);
const isValid = computed(() => !error.value && endpointName.value?.length > 0 && endpointName.value?.length <= 80 && endpointName.value !== props.endpoint.name);
const nameEdit = useTemplateRef("nameEdit");

function close() {
  emit("close");
}

function save() {
  if (isValid.value) {
    emit("save", endpointName.value);
    close();
  }
}

watch(endpointName, () => (error.value = endpoints.value.find((endpoint) => endpoint !== props.endpoint && endpoint.name === endpointName.value) ? "This name is already in use" : null));

onMounted(() => {
  nameEdit.value?.focus();
});
</script>

<template>
  <ModalDialog id="rename-endpoint" title="Edit Endpoint Name" @close="close">
    <template #modalBody>
      <div class="alert alert-danger" role="alert" v-if="error">{{ error }}</div>
      <input ref="nameEdit" class="form-control mt-1 mb-1" minlength="1" :maxlength="80" v-model="endpointName" @keyup.enter="save" />
      <div class="count">{{ currentLength ?? 0 }}/{{ 80 }} characters</div>
    </template>
    <template #modalFooter="{ close }">
      <ActionButton aria-label="Save Endpoint Name" variant="primary" @click="save" :disabled="!isValid">Apply</ActionButton>
      <ActionButton aria-label="Close Endpoint Name Dialog" @click="close">Cancel</ActionButton>
    </template>
  </ModalDialog>
</template>

<style scoped>
div.count {
  font-size: 0.65rem;
  display: flex;
  justify-content: end;
}

.alert {
  margin-top: 0;
}
</style>
