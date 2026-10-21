<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { EndpointClassification, type Endpoint } from "@/resources/LicenseDetails";
import FAIcon from "@/components/FAIcon.vue";
import Modal from "@/components/ModalDialog.vue";
import EndpointName from "./EndpointName.vue";
import ActionButton from "@/components/ActionButton.vue";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { faCircleChevronUp } from "@fortawesome/free-solid-svg-icons";
import useIsLicenseDetailAmendmentSupported from "./isLicenseDetailAmendmentSupported.ts";

const props = defineProps<{ endpoint: Endpoint }>();
const emit = defineEmits(["collapse"]);

const licenseDetailsStore = useLicenseDetailsStore();
const isLicenseDetailAmendmentSupported = useIsLicenseDetailAmendmentSupported();

const endpointClassificationStyle = computed(() => {
  switch (props.endpoint.classification) {
    case EndpointClassification.Full:
      return !props.endpoint.matchesLicensedSize ? "--size-mismatch" : "--full";
    case EndpointClassification.SendOnly:
      return "--send-only";
    default:
      throw new Error("Invalid endpoint classification");
  }
});

const endpointName = ref(props.endpoint.name);
const showRemove = ref(false);
const showRename = ref(false);

function removeEndpoint() {
  licenseDetailsStore.removeEndpoint(props.endpoint);
  showRemove.value = false;
}

function renameEndpoint(name: string) {
  licenseDetailsStore.renameEndpoint(props.endpoint, name);
}

function reclassifyEndpoint(value: EndpointClassification) {
  licenseDetailsStore.reclassifyEndpoint(props.endpoint, value);
}

watch(
  () => props.endpoint.name,
  (newValue) => (endpointName.value = newValue)
);
</script>

<template>
  <div class="endpoint-header" v-bind="$attrs" :key="endpoint.clientId" :style="{ '--endpoint-header-bg': `var(${endpointClassificationStyle})` }">
    <div class="endpoint-name">
      <FAIcon :icon="faCircleChevronUp" class="collapse-button" size="lg" tabindex="0" title="collapse" @click="emit('collapse')" />
      <strong v-tippy="endpoint.name">{{ endpoint.name }}</strong>
    </div>
    <div class="header-buttons" v-if="isLicenseDetailAmendmentSupported">
      <div>
        <label :for="`${endpoint.clientId}classification`">Classification:</label>
        <select :id="`${endpoint.clientId}classification`" @change="(e) => reclassifyEndpoint(Number((e.target as HTMLSelectElement).value))" :value="endpoint.classification" class="form-select">
          <option v-for="[name, classification] in Object.entries(EndpointClassification).filter(([, val]) => typeof val === 'number')" :value="classification" :key="classification">{{ name }}</option>
        </select>
      </div>
      <ActionButton variant="secondary" @click="showRename = true">Rename</ActionButton>
      <ActionButton variant="secondary" @click="showRemove = true">Remove</ActionButton>
    </div>
  </div>

  <Modal v-if="showRemove" id="remove-endpoint" title="Remove Endpoint" @close="showRemove = false">
    <template #modalBody>
      <span>Please confirm removing Endpoint: {{ endpoint.name }}</span>
      <div class="mt-3 title">{{ endpoint.queues.length }} queues will be assigned to Unassigned Queues.</div>
    </template>
    <template #modalFooter="{ close }">
      <ActionButton aria-label="Confirm Remove Endpoint" variant="primary" @click="removeEndpoint">Remove</ActionButton>
      <ActionButton aria-label="Close Remove Endpoint Dialog" @click="close">Cancel</ActionButton>
    </template>
  </Modal>
  <EndpointName v-if="showRename" :endpoint="endpoint" @close="showRename = false" @save="renameEndpoint" />
</template>

<style scoped>
.endpoint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: hsl(from var(--endpoint-header-bg) h s 90%);
}

/* not currently used */
.dark-mode .endpoint-header {
  background-color: var(--endpoint-header-bg);
}

.endpoint-header div {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.endpoint-header div.header-buttons {
  gap: 0.25rem;
}

.collapse-button {
  cursor: pointer;
  color: hsl(from var(--bs-body-color) h s l / 50%);
}

.collapse-button:hover {
  color: inherit;
}

.endpoint-header .endpoint-name {
  flex-basis: calc(min(40em, 35vw));
  overflow: hidden;
}

.endpoint-header .endpoint-name strong {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.header-buttons label {
  margin: 0;
}
</style>
