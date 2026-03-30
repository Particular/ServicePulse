<script lang="ts" setup>
import { ref, watch } from "vue";
import { type Language, type StackTraceElement, languages, detectLanguagesInOrder, formatStackTrace } from "./StacktraceFormatter/stacktraceFormatter";

// Define TypeScript interfaces for settings and supported languages
interface NetStackOptions {
  frame?: string;
  type?: string;
  method?: string;
  paramsList?: string;
  paramType?: string;
  paramName?: string;
  file?: string;
  line?: string;
}

// Props
const props = withDefaults(defineProps<{ stackTrace: string; options?: NetStackOptions }>(), {
  options: () => ({
    frame: "st-frame",
    type: "st-type",
    method: "st-method",
    paramsList: "st-frame-params",
    paramType: "st-param-type",
    paramName: "st-param-name",
    file: "st-file",
    line: "st-line",
  }),
});

// Reactive variables and setup state
const formattedStack = ref<StackTraceElement[]>([]);
const selectedLanguage = ref<Language>(languages[0]);

// Process the provided stack trace
const processStackTrace = (): void => {
  const rawContent = props.stackTrace;
  const detectedLanguages = detectLanguagesInOrder(rawContent);

  if (!detectedLanguages.length) {
    formattedStack.value = [rawContent]; // If no language detected, output raw content
    return;
  }

  selectedLanguage.value = detectedLanguages[0]; // Use the first detected language
  formattedStack.value = formatStackTrace(rawContent, selectedLanguage.value);
};

watch(
  () => props.stackTrace,
  () => {
    processStackTrace();
  },
  { immediate: true }
);
</script>

<template>
  <div class="stack-trace-container">
    <template v-for="line in formattedStack" :key="line">
      <template v-if="typeof line === 'string'">
        <span>{{ line }}</span>
      </template>
      <div v-else>
        {{ line.spaces }}{{ selectedLanguage.at }}
        <span :class="props.options.frame">
          <span :class="props.options.type">{{ line.type }}</span
          >.<span :class="props.options.method">{{ line.method }}</span
          >(<span :class="props.options.paramsList">
            <template v-for="(param, index) in line.params" :key="param.name">
              <span :class="props.options.paramType"> {{ param.type }}</span> <span :class="props.options.paramName">{{ param.name }}</span>
              <span v-if="index !== line.params.length - 1">, </span>
            </template> </span
          >)
        </span>
        <template v-if="line.file">
          {{ selectedLanguage.in }} <span :class="props.options.file">{{ line.file }}</span
          >:{{ selectedLanguage.line }} <span :class="props.options.line">{{ line.lineNumber }}</span>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stack-trace-container {
  font-family: monospace;
  white-space: pre-wrap;
}

.st-frame {
  color: #00729c;
}

.st-type {
  color: #a11;
}

.st-method {
  color: #164;
}

.st-file {
  color: #c67b3d;
}

.st-line {
  color: #6c757d;
}

.st-param-type {
  font-style: italic;
  color: #6b82ce;
}

.st-param-name {
  font-weight: bold;
  color: #343a40;
}

.st-frame-params {
  color: #495057;
}
</style>
