<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import CodeEditor from "@/components/CodeEditor.vue";
import DiffMaximizeIcon from "@/assets/diff-maximize.svg";
import DiffCloseIcon from "@/assets/diff-close.svg";
import { Extension } from "@codemirror/state";
import { CodeLanguage } from "@/components/codeEditorTypes";

const modelValue = defineModel<string>({ required: true });

withDefaults(
  defineProps<{
    language?: CodeLanguage;
    readOnly?: boolean;
    showGutter?: boolean;
    showCopyToClipboard?: boolean;
    ariaLabel?: string;
    extensions?: Extension[];
    modalTitle?: string;
  }>(),
  {
    readOnly: false,
    showGutter: false,
    showCopyToClipboard: false,
    extensions: () => [],
    modalTitle: "Code View",
  }
);

// Component state for maximize functionality
const showMaximizeModal = ref(false);

// Handle maximize functionality
const toggleMaximizeModal = () => {
  showMaximizeModal.value = !showMaximizeModal.value;
};

// Handle ESC key to close modal
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && showMaximizeModal.value) {
    showMaximizeModal.value = false;
  }
};

// Setup keyboard events for maximize modal
onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

// Clean up event listeners when component is destroyed
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div class="code-editor-wrapper">
    <!-- Regular CodeEditor with maximize button in toolbarRight -->
    <CodeEditor class="maximazable-code-editor--inline-instance" v-model="modelValue" :language="language" :read-only="readOnly" :show-gutter="showGutter" :show-copy-to-clipboard="showCopyToClipboard" :aria-label="ariaLabel" :extensions="extensions">
      <template #toolbarLeft>
        <slot name="toolbarLeft"></slot>
      </template>
      <template #toolbarRight>
        <slot name="toolbarRight"></slot>
        <img class="maximize-icon-inline" :src="DiffMaximizeIcon" alt="Maximize" @click="toggleMaximizeModal" title="Maximize view" />
      </template>
    </CodeEditor>

    <!-- Maximize modal for CodeEditor -->
    <div v-if="showMaximizeModal" class="maximize-modal">
      <div class="maximize-modal-content">
        <div class="maximize-modal-toolbar">
          <span class="maximize-modal-title">{{ modalTitle }}</span>
          <img class="maximize-modal-close" :src="DiffCloseIcon" alt="Close" @click="toggleMaximizeModal" title="Close" />
        </div>
        <div class="maximize-modal-body">
          <CodeEditor class="maximazable-code-editor--pop-up-instance" v-model="modelValue" :language="language" :read-only="readOnly" :show-copy-to-clipboard="true" :show-gutter="true" :aria-label="ariaLabel" :extensions="[]" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.code-editor-wrapper {
  position: relative;
  width: 100%;
}

/* Maximize icon styles */
.maximize-icon-inline {
  width: 14px;
  height: 14px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  margin-left: 8px;
}

.maximize-icon-inline:hover {
  opacity: 1;
}

/* Modal styles copied from DiffViewer */
.maximize-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.maximize-modal-content {
  background-color: white;
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.maximize-modal-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #ddd;
}

.maximize-modal-title {
  font-weight: bold;
  font-size: 16px;
}

.maximize-modal-close {
  background: none;
  border: none;
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.maximize-modal-body {
  flex: 1;
  overflow: auto;
  padding: 15px;
}

/* Ensure the CodeEditor wrapper fills the modal body */
.maximize-modal-body :deep(.wrapper) {
  height: calc(100% - 20px);
}

.maximize-modal-body :deep(.cm-editor),
.maximize-modal-body :deep(.cm-scroller) {
  height: 100%;
}
</style>
