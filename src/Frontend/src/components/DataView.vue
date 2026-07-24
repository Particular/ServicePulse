<script setup lang="ts" generic="T">
import { ref, computed, watch } from "vue";
import ItemsPerPage from "@/components/ItemsPerPage.vue";
import PaginationStrip from "@/components/PaginationStrip.vue";

const props = withDefaults(
  defineProps<{
    data: T[];
    itemsPerPageOptions?: number[];
    itemsPerPage?: number;
    showPagination?: boolean;
    stickyPagination?: boolean;
    showItemsPerPage?: boolean;
  }>(),
  { itemsPerPageOptions: () => [20, 35, 50, 75], itemsPerPage: 50, showPagination: true, showItemsPerPage: false }
);

const pageNumber = ref(1);
const itemsPerPage = ref(props.itemsPerPage);
const pageData = computed(() => props.data.slice((pageNumber.value - 1) * itemsPerPage.value, Math.min(pageNumber.value * itemsPerPage.value, props.data.length)));

const emit = defineEmits<{ itemsPerPageChanged: [value: number]; pageChanged: [] }>();

watch(itemsPerPage, () => emit("itemsPerPageChanged", itemsPerPage.value));
watch(pageNumber, () => emit("pageChanged"));
</script>

<template>
  <slot name="data" :pageData="pageData" :pageNumber="pageNumber" />
  <div class="row" :class="{ 'sticky-pagination': stickyPagination }">
    <ItemsPerPage v-if="showItemsPerPage" v-model="itemsPerPage" :options="itemsPerPageOptions" />
    <PaginationStrip v-if="showPagination" v-model="pageNumber" :totalCount="data.length" :itemsPerPage="itemsPerPage" />
  </div>
</template>

<style scoped>
.sticky-pagination {
  position: sticky;
  bottom: 0;
  margin-bottom: 0;
  margin-top: 3em;
}

.sticky-pagination {
  --shadow-color: hsl(215deg 50% 30%);
  filter: drop-shadow(2px 4px 8px hsl(from var(--shadow-color) h s l / 0.4));
}
</style>

<style>
/* use smaller margins for sticky version, since we want it close to the bottom of the screen when scrolling */
.sticky-pagination .pagination {
  margin: 0 1.5rem;
}
</style>
