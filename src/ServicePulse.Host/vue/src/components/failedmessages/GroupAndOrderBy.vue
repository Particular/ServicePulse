<script setup>
import { ref, onMounted } from "vue";
import { useFetchFromServiceControl } from "../../composables/serviceServiceControlUrls";
import { useSortingsAndGroupClassifiers } from "../../composables/serviceSortingsAndGroupClassifiers";

const sortingHelper = new useSortingsAndGroupClassifiers();
const emit = defineEmits(["sortUpdated", "filterTextUpdated"]);
const selectedClassifier = ref(null);
const classifiers = ref([]);
const selectedSort = ref("Name");

function getGroupingClassifiers() {
  return useFetchFromServiceControl("recoverability/classifiers")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      classifiers.value = data;
    });
}

function sortUpdated(sort) {
  selectedSort.value = sort.description + (sort.dir == "desc" ? " (Descending)" : "");
  sortingHelper.saveSortOption(sort.description, sort.dir);

  sort.sort = sortingHelper.getSortFunction(sort.selector, sort.dir);

  emit('sortUpdated', sort);
}

function setSortOptions() {
  const savedSort = sortingHelper.loadSavedSortOption();
  selectedSort.value = savedSort.description + (savedSort.dir == "desc" ? " (Descending)" : "");
  
  emit('sortUpdated', savedSort);
}

onMounted(() => {
  setSortOptions();

  getGroupingClassifiers();
});
</script>

<template>
  <div class="msg-group-menu dropdown">
    <label class="control-label">Group by:</label>
    <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      {{ selectedClassifier }}
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu">
      <li v-for="(classifier, index) in classifiers" :key="index">
        <a :href="'failed-messages#failed-message-groups/groups?groupBy=' + classifier">{{ classifier }}</a>
      </li>
    </ul>
  </div>

  <div class="msg-group-menu dropdown">
    <label class="control-label">Sort by:</label>
    <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      {{ selectedSort }}
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu">
      <span v-for="(sort, index) in sortingHelper.getSortOptions()" :key="index">
        <li>
          <a @click="sortUpdated({ selector: sort.selector, dir: 'asc', description: sort.description })" href="#">{{ sort.description }}</a>
        </li>
        <li>
          <a @click="sortUpdated({ selector: sort.selector, dir: 'desc', description: sort.description })" href="#">{{ sort.description }}<span> (Descending)</span></a>
        </li>
      </span>
    </ul>
  </div>
</template>

<style>
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