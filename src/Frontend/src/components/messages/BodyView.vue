<script setup lang="ts">
import { computed, ref, watch } from "vue";
import CodeEditor from "@/components/CodeEditor.vue";
import HexView from "@/components/messages/HexView.vue";
import parseContentType from "@/composables/contentTypeParser";
import { useMessageStore } from "@/stores/MessageStore";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { storeToRefs } from "pinia";

type ViewMode = "formatted" | "hex";

const store = useMessageStore();
const { body: bodyState, state } = storeToRefs(store);
const viewMode = ref<ViewMode>("formatted");

watch(
  () => state.value.data.body_url,
  async () => {
    await store.downloadBody();
  },
  { immediate: true }
);
const contentType = computed(() => parseContentType(bodyState.value.data.content_type));
const body = computed(() => bodyState.value.data.value);
const rawBytes = computed(() => bodyState.value.data.rawBytes);
const parseFailed = computed(() => bodyState.value.data.parse_failed);

watch(
  parseFailed,
  (failed) => {
    if (failed) viewMode.value = "hex";
  },
  { immediate: true }
);
</script>

<template>
  <div class="gap">
    <div v-if="bodyState.not_found" class="alert alert-info">Could not find the message body. This could be because the message URL is invalid or the corresponding message was processed and is no longer tracked by ServiceControl.</div>
    <div v-else-if="bodyState.failed_to_load" class="alert alert-info">Message body unavailable.</div>
    <LoadingSpinner v-else-if="bodyState.loading" />
    <div v-else-if="bodyState.data.no_content" class="alert alert-info">
      Body was too large and not stored. Edit <a href="https://docs.particular.net/servicecontrol/audit-instances/configuration#performance-tuning-servicecontrol-auditmaxbodysizetostore">ServiceControl/MaxBodySizeToStore</a> to be larger in the
      ServiceControl configuration.
    </div>
    <template v-else-if="rawBytes">
      <div v-if="parseFailed" class="alert alert-warning">Message body could not be parsed as {{ bodyState.data.content_type }}. Showing hex view.</div>
      <div class="btn-group btn-group-sm" role="group" aria-label="View mode">
        <button type="button" :class="['btn', viewMode === 'formatted' ? 'btn-primary' : 'btn-outline-secondary']" @click="viewMode = 'formatted'">Formatted</button>
        <button type="button" :class="['btn', viewMode === 'hex' ? 'btn-primary' : 'btn-outline-secondary']" @click="viewMode = 'hex'">Hex</button>
      </div>
      <CodeEditor v-if="viewMode === 'formatted' && body !== undefined && contentType.isSupported" :model-value="body" :language="contentType.language" :read-only="true" :show-gutter="true" />
      <div v-else-if="viewMode === 'formatted' && !contentType.isSupported" class="alert alert-warning">Message body cannot be displayed because content type "{{ bodyState.data.content_type }}" is not supported.</div>
      <HexView v-else-if="viewMode === 'hex'" :data="rawBytes" />
    </template>
  </div>
</template>

<style scoped>
.gap {
  margin-top: 5px;
}

.btn-group {
  margin-bottom: 5px;
}
</style>
