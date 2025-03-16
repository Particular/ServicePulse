<script setup lang="ts">
import { ExtendedFailedMessage } from "@/resources/FailedMessage";
import CopyToClipboard from "@/components/CopyToClipboard.vue";
const props = defineProps<{
  message: ExtendedFailedMessage;
}>();
</script>

<template>
  <table class="table" v-if="!props.message.headersNotFound">
    <tbody>
      <tr class="interactiveList" v-for="(header, index) in props.message.headers" :key="index">
        <td nowrap="nowrap">{{ header.key }}</td>
        <td class="toolbar">
          <!--
          <pre>{{ header.value }}</pre>
          <span>
            <CopyToClipboard :value="header.value || ''" />
            
          </span>
          -->
          <!-- Use flexbox to align items horizontally -->
          <div style="display: flex; align-items: center">
            <!-- The pre element should not wrap, so use white-space: nowrap or keep it as a block element -->
            <pre style="margin: 0; white-space: nowrap">{{ header.value }}</pre>
            <CopyToClipboard :value="header.value || ''" />
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <div v-if="props.message.headersNotFound" class="alert alert-info">Could not find message headers. This could be because the message URL is invalid or the corresponding message was processed and is no longer tracked by ServiceControl.</div>
</template>

<style scoped></style>
