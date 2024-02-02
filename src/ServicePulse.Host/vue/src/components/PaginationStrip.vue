<script setup>
import { computed } from "vue";

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
  pageBuffer: {
    type: Number,
    default: 5,
  },
});

const numberOfPages = computed(() => {
  return Math.ceil(props.totalCount / props.itemsPerPage);
});

const showPagination = computed(() => {
  return numberOfPages.value > 1;
});

const emit = defineEmits(["pageChanged"]);

function setPage(page) {
  if (page > numberOfPages.value) {
    page = numberOfPages.value;
  } else if (page < 1) {
    page = 1;
  }
  emit("pageChanged", page);
}

const doublePageBuffer = computed(() => props.pageBuffer * 2);

const pages = computed(() => {
  const pages = [];
  pages.push({
    label: "Previous",
    click: () => setPage(props.pageNumber - 1),
    key: "Previous Page",
    class: {
      disabled: props.pageNumber === 1,
    },
  });

  if (props.pageNumber > props.pageBuffer + 1 && numberOfPages.value >= doublePageBuffer.value) {
    pages.push(
      {
        label: "1",
        click: () => setPage(1),
        key: "First Page",
      },
      {
        label: "...",
        click: () => setPage(props.pageNumber - props.pageBuffer),
        key: `Back ${props.pageBuffer}`,
      }
    );
  }

  let startIndex = props.pageNumber - props.pageBuffer;
  let endIndex = props.pageNumber + props.pageBuffer;
  if (startIndex < 1) {
    // Increase the end index by the offset
    endIndex -= startIndex;
    startIndex = 1;
  }

  let showEnd = false;
  if (endIndex >= numberOfPages.value) {
    endIndex = numberOfPages.value;
    showEnd = true;
  }

  // All of the surrounding pages
  for (let n = startIndex; n <= endIndex; n++) {
    pages.push({
      label: `${n}`,
      click: () => setPage(n),
      key: `Page ${n}`,
      class: {
        active: n === props.pageNumber,
      },
    });
  }

  if (!showEnd) {
    pages.push(
      {
        label: "...",
        click: () => setPage(props.pageNumber + props.pageBuffer),
        key: `Forward ${props.pageBuffer}`,
      },
      {
        label: `${numberOfPages.value}`,
        click: () => setPage(numberOfPages.value),
        key: `Last Page`,
      }
    );
  }

  pages.push({
    label: "Next",
    click: () => setPage(props.pageNumber + 1),
    key: "Next Page",
    class: {
      disabled: props.pageNumber === numberOfPages.value,
    },
  });

  return pages;
});
</script>

<template>
  <div v-if="showPagination" class="col align-self-center">
    <ul class="pagination justify-content-center">
      <li v-for="page of pages" class="page-item" :key="page.key">
        <a class="page-link" @click="page.click" :class="page.class">{{ page.label }}</a>
      </li>
    </ul>
  </div>
</template>

<style>
.page-link {
  cursor: pointer;
}

.page-link.disabled {
  cursor: not-allowed;
  pointer-events: all !important;
}
</style>
