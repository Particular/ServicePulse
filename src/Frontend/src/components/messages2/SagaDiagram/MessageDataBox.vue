<script setup lang="ts">
import { SagaMessageData, useSagaDiagramStore } from "@/stores/SagaDiagramStore";
import { storeToRefs } from "pinia";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import MaximizableCodeEditor from "@/components/MaximizableCodeEditor.vue";
import { computed } from "vue";
import { CodeLanguage } from "@/components/codeEditorTypes";
import { parse, stringify } from "lossless-json";
import { EditorView } from "@codemirror/view";

const messageDataBoxTheme = EditorView.baseTheme({
  ".maximazable-code-editor--inline-instance .cm-editor": {
    fontFamily: "monospace",
    fontSize: "0.75rem",
    backgroundColor: "#ffffff",
  },
  ".maximazable-code-editor--inline-instance .cm-scroller": {
    backgroundColor: "#ffffff",
  },
});

const props = defineProps<{
  messageData: SagaMessageData;
}>();

const sagaDiagramStore = useSagaDiagramStore();
const { messageDataLoading } = storeToRefs(sagaDiagramStore);

const formattedData = computed(() => {
  if (props.messageData.type === "json" && props.messageData.data) {
    try {
      // Parse and then stringify with indentation to ensure proper formatting
      const parsed = parse(props.messageData.data);
      return stringify(parsed, null, 2);
    } catch {
      return props.messageData.data;
    }
  }
  return props.messageData.data;
});

// Ensure language is properly typed as CodeLanguage
const editorLanguage = computed<CodeLanguage>(() => {
  const type = props.messageData.type?.toLowerCase();
  return (type === "xml" ? "xml" : "json") as CodeLanguage;
});
</script>

<template>
  <div v-if="messageDataLoading" class="message-data-loading">
    <LoadingSpinner />
  </div>
  <div v-else-if="messageData.error" class="message-data-box message-data-box-error">
    <span class="message-data-box-text--error">An error occurred while parsing the message data</span>
  </div>
  <div v-else-if="!messageDataLoading && messageData.data === ''" class="message-data-box">
    <span class="message-data-box-text--empty">Empty</span>
  </div>
  <div v-else class="message-data-box message-data-box-content">
    <MaximizableCodeEditor :model-value="formattedData || ''" :language="editorLanguage" :read-only="true" :show-gutter="false" modalTitle="Message Data" :extensions="[messageDataBoxTheme]" />
  </div>
</template>

<style scoped>
.message-data-box {
  display: flex;
}

.message-data-box-content {
  display: block;
}

.message-data-box-text {
  display: inline-block;
  margin-right: 0.25rem;
}

.message-data-box-text--ellipsis {
  display: inline-block;
  overflow: hidden;
  max-width: 100%;
  padding: 0%;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.message-data-box-text--empty {
  display: inline-block;
  width: 100%;
  text-align: center;
  color: #666;
  font-style: italic;
}

.message-data-box-text--error {
  display: inline-block;
  width: 100%;
  text-align: center;
  color: #a94442;
  font-style: italic;
}

.message-data-loading {
  display: flex;
  justify-content: center;
  align-items: center;
}

.message-data-box-error {
  padding: 1rem;
  justify-content: center;
}
</style>
