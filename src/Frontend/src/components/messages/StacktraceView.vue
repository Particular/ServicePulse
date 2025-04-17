<script setup lang="ts">
import CodeEditor from "@/components/CodeEditor.vue";
import { ExtendedFailedMessage } from "../messages2/FailedMessage";

const props = defineProps<{
  message: ExtendedFailedMessage;
}>();
</script>

<template>
  <CodeEditor :model-value="props.message.exception.stack_trace" language="powershell" :read-only="true" :show-gutter="false"></CodeEditor>
</template>
