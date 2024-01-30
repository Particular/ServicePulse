<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useFetchFromServiceControl } from "../composables/serviceServiceControlUrls";

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
    default: 0,
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
const showPagination = computed(() => {
  return props.showPagination && numberOfPages.value > 1;
});

const numberOfPages = computed(() => {
  return Math.ceil(totalCount.value / itemsPerPage.value);
});

const showItemsPerPage = computed(() => {
  return props.showItemsPerPage;
});

function changeItemsPerPage(value) {
  itemsPerPage.value = value;
  loadData();
}

function calculatePageNumbers() {
  if (numberOfPages.value <= 10) {
    return Array.from(Array(numberOfPages.value), (_, index) => index + 1);
  }

  let startIndex = pageNumber.value - 5;
  let endIndex = pageNumber.value + 5;
  if (startIndex < 0) {
    // Increase the end index by the offset
    endIndex -= startIndex;
    startIndex = 0;
  }

  if (endIndex > numberOfPages.value) {
    endIndex = numberOfPages.value;
  }

  return Array.from(Array(endIndex - startIndex), (_, index) => index + startIndex + 1);
}

function nextPage() {
  pageNumber.value = pageNumber.value + 1;
  if (pageNumber.value > numberOfPages.value) {
    pageNumber.value = numberOfPages.value;
  }
  loadData();
}

function previousPage() {
  pageNumber.value = pageNumber.value - 1;
  if (pageNumber.value == 0) {
    pageNumber.value = 1;
  }
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
  if (props.autoRefresh > 0) {
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
  stopRefreshTimer();
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
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li v-for="option in props.itemsPerPageOptions" :key="option">
            <a @click.prevent="changeItemsPerPage(option)" href="#">{{ option }}</a>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="showPagination" class="col align-self-center">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: pageNumber === 1 }">
          <a class="page-link" href="#" @click.prevent="previousPage">Previous</a>
        </li>
        <li v-if="pageNumber > 5 && numberOfPages > 10" class="page-item">
          <a @click.prevent="setPage(1)" class="page-link" href="#">1</a>
        </li>
        <li v-if="pageNumber > 5 && numberOfPages > 10" class="page-item">
          <a @click.prevent="setPage(pageNumber - 5)" class="page-link" href="#">...</a>
        </li>
        <li v-for="n in calculatePageNumbers()" class="page-item" :class="{ active: pageNumber == n }" :key="n">
          <a @click.prevent="setPage(n)" class="page-link" href="#">{{ n }}</a>
        </li>
        <li v-if="numberOfPages - pageNumber > 5" class="page-item">
          <a @click.prevent="setPage(pageNumber + 5)" class="page-link" href="#">...</a>
        </li>
        <li v-if="numberOfPages - pageNumber > 5" class="page-item">
          <a @click.prevent="setPage(numberOfPages)" class="page-link" href="#">{{ numberOfPages }}</a>
        </li>
        <li class="page-item" :class="{ disabled: pageNumber === numberOfPages }">
          <a class="page-link" href="#" @click.prevent="nextPage">Next</a>
        </li>
      </ul>
    </div>
  </div>
  <slot name="footer" :count="totalCount"></slot>
</template>
