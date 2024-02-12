<script setup>
import { onMounted, ref } from "vue";
import { useCookies } from "vue3-cookies";

const emit = defineEmits(["sortUpdated"]);

const props = defineProps({
  hideSort: Boolean,
  sortOptions: Array,
  sortSavePrefix: String,
});

const cookies = useCookies().cookies;

const selectedSort = ref(props.sortOptions[0].description);

function getSortOptions() {
  return props.sortOptions;
}

function saveSortOption(sortCriteria, sortDirection) {
  cookies.set(`${props.sortSavePrefix ? props.sortSavePrefix : ""}sortCriteria`, sortCriteria);
  cookies.set(`${props.sortSavePrefix ? props.sortSavePrefix : ""}sortDirection`, sortDirection);
}

function loadSavedSortOption() {
  const criteria = cookies.get(`${props.sortSavePrefix ? props.sortSavePrefix : ""}sortCriteria`);
  const direction = cookies.get(`${props.sortSavePrefix ? props.sortSavePrefix : ""}sortDirection`);

  if (criteria && direction) {
    const sortBy = getSortOptions().find((sort) => {
      return sort.description.toLowerCase() === criteria.toLowerCase();
    });
    return { sort: getSortFunction(sortBy.selector, direction), dir: direction, description: sortBy.description };
  }

  return props.sortOptions[0];
}

function getSortFunction(selector, dir) {
  return (firstElement, secondElement) => {
    if (dir === "asc") {
      return selector(firstElement) < selector(secondElement) ? -1 : 1;
    } else {
      return selector(firstElement) < selector(secondElement) ? 1 : -1;
    }
  };
}

function sortUpdated(sort) {
  selectedSort.value = sort.description + (sort.dir === "desc" ? " (Descending)" : "");
  saveSortOption(sort.description, sort.dir);

  sort.sort = getSortFunction(sort.selector, sort.dir);

  emit("sortUpdated", sort);
}

function setSortOptions(isInitialLoad) {
  const savedSort = loadSavedSortOption();
  selectedSort.value = savedSort.description + (savedSort.dir === "desc" ? " (Descending)" : "");

  emit("sortUpdated", savedSort, isInitialLoad);
}

defineExpose({
  getSortFunction,
});

onMounted(() => {
  setSortOptions(true);
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
          <button @click="sortUpdated({ selector: sort.selector, dir: 'asc', description: sort.description })"><i class="bi" :class="`${sort.icon}up`"></i>{{ sort.description }}</button>
        </li>
        <li>
          <button @click="sortUpdated({ selector: sort.selector, dir: 'desc', description: sort.description })"><i class="bi" :class="`${sort.icon}down`"></i>{{ sort.description }}<span> (Descending)</span></button>
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
