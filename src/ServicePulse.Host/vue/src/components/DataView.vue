<script setup lang="ts" generic="T">
import { onMounted, onUnmounted, ref, watch } from "vue";
// eslint-disable-next-line vue/prefer-import-from-vue
import type { UnwrapRefSimple } from "@vue/reactivity";
import { useTypedFetchFromServiceControl } from "../composables/serviceServiceControlUrls";
import ItemsPerPage from "../components/ItemsPerPage.vue";
import PaginationStrip from "../components/PaginationStrip.vue";

const props = withDefaults(
  defineProps<{
    itemsType: T[];
    apiUrl: string;
    itemsPerPageOptions?: number[];
    itemsPerPage?: number;
    autoRefreshSeconds: number;
    showPagination?: boolean;
    showItemsPerPage?: boolean;
  }>(),
  { itemsPerPageOptions: () => [20, 35, 50, 75], itemsPerPage: 50, showPagination: true, showItemsPerPage: false }
);

const refreshTimer = ref<number>();
const items = ref<T[]>([]);
const pageNumber = ref(1);
const itemsPerPage = ref(props.itemsPerPage);
const totalCount = ref(0);

watch(
  () => props.autoRefreshSeconds,
  () => {
    stopRefreshTimer();
    startRefreshTimer();
  }
);

watch(itemsPerPage, () => loadData());
watch(pageNumber, () => loadData());

async function loadData() {
  const [response, data] = await useTypedFetchFromServiceControl<T[]>(`${props.apiUrl}?page=${pageNumber.value}&per_page=${itemsPerPage.value}`);
  if (response.ok) {
    totalCount.value = parseInt(response.headers.get("Total-Count") ?? "0");
    items.value = data as UnwrapRefSimple<T>[];
  }
}

function startRefreshTimer() {
  if (props.autoRefreshSeconds) {
    refreshTimer.value = setInterval(() => {
      loadData();
    }, props.autoRefreshSeconds * 1000);
  }
}

function stopRefreshTimer() {
  clearInterval(refreshTimer.value);
}

onMounted(() => {
  startRefreshTimer();
  loadData();
});

onUnmounted(() => {
  stopRefreshTimer();
});
</script>

<template>
  <slot name="data" v-bind="items"></slot>
  <div class="row">
    <ItemsPerPage v-if="showItemsPerPage" v-model="itemsPerPage" :options="itemsPerPageOptions" />
    <PaginationStrip v-if="showPagination" v-model="pageNumber" :totalCount="totalCount" :itemsPerPage="itemsPerPage" />
  </div>
  <slot name="footer" :count="totalCount"></slot>
</template>
