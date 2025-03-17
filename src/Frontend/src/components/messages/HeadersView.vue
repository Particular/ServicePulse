<script setup lang="ts">
import { ExtendedFailedMessage } from "@/resources/FailedMessage";
import CopyToClipboard from "@/components/CopyToClipboard.vue";
import { computed, ref } from "vue";
const props = defineProps<{
  message: ExtendedFailedMessage;
}>();

const hoverStates = ref<Record<number, boolean>>({});
const searchTerm = ref<string>("");
const toggleHover = (index: number, state: boolean) => {
  hoverStates.value[index] = state;
};
// Computed property to filter headers based on search term
const filteredHeaders = computed(() => {
  if (!searchTerm.value) {
    return props.message.headers;
  }
  return props.message.headers.filter((header) => header.key.toLowerCase().includes(searchTerm.value.toLowerCase()));
});
function clearSearch() {
  searchTerm.value = ""; // Clears the search term
}
</script>

<template>
  <div class="searchheader">
    <input v-model="searchTerm" type="text" placeholder="Search for a header key" class="search-input" />
    <button v-if="searchTerm" title="Clear" @click="clearSearch" class="clear-btn">X</button>
  </div>

  <table class="table" v-if="!props.message.headersNotFound">
    <tbody>
      <tr class="interactiveList" v-for="(header, index) in filteredHeaders" :key="index">
        <td nowrap="nowrap">{{ header.key }}</td>
        <td>
          <div class="headercopy" @mouseover="toggleHover(index, true)" @mouseleave="toggleHover(index, false)">
            <pre>{{ header.value }}</pre>
            <CopyToClipboard v-if="hoverStates[index]" :value="header.value || ''" :isIconOnly="true" />
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <div v-if="props.message.headersNotFound" class="alert alert-info">Could not find message headers. This could be because the message URL is invalid or the corresponding message was processed and is no longer tracked by ServiceControl.</div>
</template>

<style scoped>
.headercopy {
  display: flex;
  align-items: top;
  gap: 0.4rem;
}
.searchheader {
  display: flex;
  /*  justify-content: flex-end;*/
  align-items: center;
  margin-bottom: 10px;
}

/* Style for the search input */
.search-input {
  padding: 5px;
  margin-right: 10px;
}

/* Style for the clear button */
.clear-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  margin: 0;
  font-weight: bold;
}
</style>
