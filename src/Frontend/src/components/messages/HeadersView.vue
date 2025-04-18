<script setup lang="ts">
import { ExtendedFailedMessage } from "@/resources/FailedMessage";
import CopyToClipboard from "@/components/CopyToClipboard.vue";
import FilterInput from "@/components/FilterInput.vue";
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
  return props.message.headers.filter((header) => header.key.toLowerCase().includes(searchTerm.value.toLowerCase()) || header.value?.toLowerCase().includes(searchTerm.value.toLowerCase()));
});
</script>

<template>
  <div>
    <div class="row filters">
      <div class="col">
        <div class="text-search-container">
          <div class="text-search">
            <div class="filter-group">
              <FilterInput v-model="searchTerm" :aria-label="`Search for a header key or value`" :placeholder="'Search for a header key or value...'" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <table class="table" v-if="filteredHeaders.length > 0 && !props.message.headersNotFound">
    <tbody>
      <tr class="interactiveList" v-for="(header, index) in filteredHeaders" :key="index">
        <td nowrap="nowrap">{{ header.key }}</td>
        <td>
          <div class="headercopy" @mouseover="toggleHover(index, true)" @mouseleave="toggleHover(index, false)">
            <pre>{{ header.value }}</pre>
            <CopyToClipboard v-if="hoverStates[index] && header.value" :value="header.value" :isIconOnly="true" />
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Message if filtered list is empty -->
  <div v-if="filteredHeaders.length <= 0 && !props.message.headersNotFound" class="alert alert-warning">No headers found matching the search term.</div>
  <div v-if="props.message.headersNotFound" class="alert alert-info">Could not find message headers. This could be because the message URL is invalid or the corresponding message was processed and is no longer tracked by ServiceControl.</div>
</template>

<style scoped>
.headercopy {
  display: flex;
  align-items: top;
  gap: 0.4rem;
}

/*  empty filtered list message */
.alert-warning {
  margin-top: 10px;
  color: #856404;
  background-color: #fff3cd;
  border-color: #ffeeba;
  padding: 10px;
  border-radius: 5px;
}

.text-search-container {
  display: flex;
  flex-direction: row;
}
.text-search {
  width: 100%;
  max-width: 40rem;
}

.filters {
  background-color: #f3f3f3;
  margin-top: 5px;
  border: #8c8c8c 1px solid;
  border-radius: 3px;
  padding: 5px;
}
</style>
