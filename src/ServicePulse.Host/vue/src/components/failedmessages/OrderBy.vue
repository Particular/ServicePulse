<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useCookies } from "vue3-cookies";
import SortOptions, { SortDirection } from "@/resources/SortOptions";
import GroupOperation from "@/resources/GroupOperation";

const emit = defineEmits<{
  sortUpdated: [option: SortOptions];
}>();

const props = withDefaults(
  defineProps<{
    hideSort?: boolean;
    sortOptions: SortOptions[];
    sortSavePrefix?: string;
  }>(),
  {
    hideSort: false,
  }
);

const cookies = useCookies().cookies;

const selectedSort = ref(props.sortOptions[0].description);

function getSortOptions() {
  return props.sortOptions;
}

function saveSortOption(sortCriteria: string, sortDirection: SortDirection) {
  cookies.set(`${props.sortSavePrefix ? props.sortSavePrefix : ""}sortCriteria`, sortCriteria);
  cookies.set(`${props.sortSavePrefix ? props.sortSavePrefix : ""}sortDirection`, sortDirection);
}

function loadSavedSortOption() {
  const criteria = cookies.get(`${props.sortSavePrefix ? props.sortSavePrefix : ""}sortCriteria`);
  const direction = cookies.get(`${props.sortSavePrefix ? props.sortSavePrefix : ""}sortDirection`) as SortDirection;

  if (criteria && direction) {
    const sortBy = getSortOptions().find((sort) => {
      return sort.description.toLowerCase() === criteria.toLowerCase();
    });
    if (sortBy) {
      return {
        ...sortBy,
        sort: getSortFunction(sortBy.selector, direction),
        dir: direction,
      };
    }
  }

  return props.sortOptions[0];
}

function getSortFunction(selector: SortOptions["selector"], dir: SortDirection) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  if (!selector) return (firstElement: GroupOperation, secondElement: GroupOperation) => 0;
  return (firstElement: GroupOperation, secondElement: GroupOperation) => {
    if (dir === SortDirection.Ascending) {
      return selector(firstElement) < selector(secondElement) ? -1 : 1;
    } else {
      return selector(firstElement) < selector(secondElement) ? 1 : -1;
    }
  };
}

function sortUpdated(sort: SortOptions, dir: SortDirection) {
  selectedSort.value = sort.description + (dir === SortDirection.Descending ? " (Descending)" : "");
  saveSortOption(sort.description, dir);

  emit("sortUpdated", {
    ...sort,
    dir: dir,
    sort: getSortFunction(sort.selector, dir),
  });
}

function setSortOptions() {
  const savedSort = loadSavedSortOption();
  selectedSort.value = `${savedSort.description}${savedSort.dir === SortDirection.Descending ? " (Descending)" : ""}`;

  emit("sortUpdated", savedSort);
}

export interface IOrderBy {
  getSortFunction(selector: SortOptions["selector"], dir: SortDirection): (firstElement: GroupOperation, secondElement: GroupOperation) => number;
}

defineExpose<IOrderBy>({
  getSortFunction,
});

onMounted(() => {
  setSortOptions();
});
</script>

<template>
  <div class="msg-group-menu dropdown" v-show="!props.hideSort">
    <label class="control-label">Sort by:</label>
    <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      {{ selectedSort }}
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu">
      <span v-for="(sort, index) in getSortOptions()" :key="index">
        <li>
          <button @click="sortUpdated(sort, SortDirection.Ascending)"><i class="bi" :class="`${sort.icon}up`"></i>{{ sort.description }}</button>
        </li>
        <li>
          <button @click="sortUpdated(sort, SortDirection.Descending)"><i class="bi" :class="`${sort.icon}down`"></i>{{ sort.description }}<span> (Descending)</span></button>
        </li>
      </span>
    </ul>
  </div>
</template>

<style>
.dropdown-menu .bi {
  padding-right: 5px;
}

.btn.sp-btn-menu {
  background: none;
  border: none;
  color: #00a3c4;
  padding-right: 16px;
  padding-left: 16px;
}

.sp-btn-menu:hover {
  background: none;
  border: none;
  color: #00a3c4;
  text-decoration: underline;
}

.msg-group-menu {
  margin: 21px 0px 0 6px;
  padding-right: 15px;
  float: right;
}

.btn.sp-btn-menu:active,
.btn-default.sp-btn-menu:active,
.btn-default.sp-btn-menu.active,
.open > .dropdown-toggle.btn-default.sp-btn-menu {
  background: none;
  border: none;
  color: #00a3c4;
  text-decoration: underline;
  -webkit-box-shadow: none;
  box-shadow: none;
}

.sp-btn-menu > i {
  color: #00a3c4;
}
</style>
