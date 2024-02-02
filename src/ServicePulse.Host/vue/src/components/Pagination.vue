<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  itemsPerPage: {
    type: Number,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
  pageNumber: {
    type: Number,
    required: true,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
});

const numberOfPages = computed(() => {
  return Math.ceil(props.totalCount / props.itemsPerPage);
});

const showPagination = computed(() => {
  return props.showPagination && numberOfPages.value > 1;
});

const emit = defineEmits(["pageChanged"]);

function nextPage() {
  setPage(props.pageNumber + 1);
}

function previousPage() {
  setPage(props.pageNumber - 1);
}

function setPage(page) {
  if (page > numberOfPages.value) {
    page = numberOfPages.value;
  } else if (page < 1) {
    page = 1;
  }
  emit("pageChanged", page);
}

function calculatePageNumbers() {
  if (numberOfPages.value <= 10) {
    return Array.from(Array(numberOfPages.value), (_, index) => index + 1);
  }

  let startIndex = props.pageNumber - 5;
  let endIndex = props.pageNumber + 5;
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
</script>

<template>
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
      <li v-for="n in calculatePageNumbers()" class="page-item" :class="{ active: pageNumber === n }" :key="n">
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
</template>
