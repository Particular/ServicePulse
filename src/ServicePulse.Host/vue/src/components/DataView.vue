<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useFetchFromServiceControl } from "../composables/serviceServiceControlUrls";
import Pagination from "../components/Pagination.vue";
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

const showItemsPerPage = computed(() => {
  return props.showItemsPerPage;
});

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
    <div v-if="showItemsPerPage" class="pagination col-md-2">
      <div class="dropdown">
        <label class="control-label">Items Per Page:</label>
        <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          {{ itemsPerPage }}
          <span class="caret" />
        </button>
        <ul class="dropdown-menu">
          <li v-for="option in props.itemsPerPageOptions" :key="option">
            <a @click.prevent="changeItemsPerPage(option)" href="#">{{ option }}</a>
          </li>
        </ul>
      </div>
    </div>
    <Pagination :totalCount="totalCount" :itemsPerPage="itemsPerPage" :pageNumber="pageNumber" :showPagination="showPagination" @pageChanged="setPage" />
  </div>
  <slot name="footer" :count="totalCount"></slot>
</template>
