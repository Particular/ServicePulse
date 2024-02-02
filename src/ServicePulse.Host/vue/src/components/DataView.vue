<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useFetchFromServiceControl } from "../composables/serviceServiceControlUrls";
import ItemsPerPage from "../components/ItemsPerPage.vue";
import PaginationStrip from "../components/PaginationStrip.vue";
const props = defineProps({
  apiUrl: String,
  itemsPerPageOptions: {
    type: Array,
    default: () => [20, 35, 50, 75],
  },
  itemsPerPage: {
    type: Number,
    default: 50,
  },
  autoRefresh: {
    type: Number,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  showItemsPerPage: {
    type: Boolean,
    default: false,
  },
});

const refreshTimer = ref();
const items = ref([]);
const pageNumber = ref(1);
const itemsPerPage = ref(props.itemsPerPage);
const totalCount = ref(0);

watch(
  () => props.autoRefresh,
  () => {
    stopRefreshTimer();
    startRefreshTimer();
  }
);

function changeItemsPerPage(value) {
  itemsPerPage.value = value;
  loadData();
}

function setPage(page) {
  pageNumber.value = page;
  loadData();
}

async function loadData() {
  try {
    const response = await useFetchFromServiceControl(`${props.apiUrl}?page=${pageNumber.value}&per_page=${itemsPerPage.value}`);
    if (response.ok) {
      totalCount.value = parseInt(response.headers.get("Total-Count"));
      const data = await response.json();
      items.value = data;
    }
  } catch (error) {
    console.log(error);
  }
}

function startRefreshTimer() {
  if (props.autoRefresh) {
    refreshTimer.value = setInterval(() => {
      loadData();
    }, props.autoRefresh);
  }
}

function stopRefreshTimer() {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
  }
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
    <ItemsPerPage v-if="showItemsPerPage" :current="itemsPerPage" :options="itemsPerPageOptions" @changed="changeItemsPerPage" />
    <PaginationStrip v-if="showPagination" :totalCount="totalCount" :itemsPerPage="itemsPerPage" :pageNumber="pageNumber" @pageChanged="setPage" />
  </div>
  <slot name="footer" :count="totalCount"></slot>
</template>
