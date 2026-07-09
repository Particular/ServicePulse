<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue";
import { EndpointClassification, type Endpoint } from "./types";
import FAIcon from "@/components/FAIcon.vue";
import { faCircleChevronUp } from "@fortawesome/free-solid-svg-icons";

const props = defineProps<{ endpoint: Endpoint }>();
const emit = defineEmits(["collapse"]);

const endpointClassificationStyle = computed(() => {
  switch (props.endpoint.classification) {
    case EndpointClassification.Full:
      return "--full";
    case EndpointClassification.SendOnly:
      return "--send-only";
  }
});

const endpointName = ref(props.endpoint.name);
const isValid = computed(() => endpointName.value?.length > 0 && endpointName.value?.length <= 80);
const saveButton = useTemplateRef("save");
const nameEdit = useTemplateRef("nameEdit");

function saveName() {
  if (isValid.value) props.endpoint.name = endpointName.value;
}

watch(
  () => props.endpoint.name,
  (newValue) => (endpointName.value = newValue)
);
</script>

<template>
  <div class="endpoint-header" :key="endpoint.clientId" :style="{ '--endpoint-header-bg': `var(${endpointClassificationStyle})` }">
    <div class="endpoint-name">
      <FAIcon :icon="faCircleChevronUp" class="collapse-button" size="lg" tabindex="0" title="collapse" @click="emit('collapse')" />
      <strong :title="endpoint.name">{{ endpoint.name }}</strong>
    </div>
    <div>
      <label>Classification:</label>
      <select v-model="endpoint.classification" class="form-select">
        <option v-for="[name, classification] in Object.entries(EndpointClassification).filter(([, classification]) => !isNaN(Number(classification)))" :value="classification">{{ name }}</option>
      </select>
    </div>
    <div class="header-buttons d-print-none">
      <!-- <ModalButton
        class="btn btn-secondary"
        :id="`editEndpointName${endpoint.clientId}`"
        modal-title="Edit Endpoint Name"
        @[`hidden.bs.modal`]="endpointName = endpoint.name"
        @[`shown.bs.modal`]="nameEdit.focus()"
      >
        Edit Name
        <template #modalBody>
          <TextEdit ref="nameEdit" :maxlength="80" v-model="endpointName" @accept="saveButton.click()" />
        </template>
        <template #modalFooter>
          <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button ref="save" class="btn btn-primary" data-bs-dismiss="modal" @click="saveName" :disabled="!isValid">Save</button>
        </template>
      </ModalButton>
      <RemoveEndpoint :endpoint="endpoint" /> -->
    </div>
  </div>
</template>

<style scoped>
.endpoint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: hsl(from var(--endpoint-header-bg) h s 90%);
}

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
</style>
