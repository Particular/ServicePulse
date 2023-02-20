<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useFailedMessageGroupSortings } from "../../composables/serviceFailedMessageGroupSortings";
import { useFailedMessageGroupClassification } from "../../composables/serviceFailedMessageClassification";

const emit = defineEmits(["sortUpdated", "classifierUpdated"]);

const sortingHelper = new useFailedMessageGroupSortings();
const classificationHelper = new useFailedMessageGroupClassification();
const selectedClassifier = ref(null);
const classifiers = ref([]);
const selectedSort = ref("Name");
const router = useRouter();
const route = useRoute();

function getGroupingClassifiers() {
  return classificationHelper.getGroupingClassifiers().then((data) => {
    classifiers.value = data;
  });
}

function classifierChanged(classifier) {
  selectedClassifier.value = classifier;
  router.push({ path: "/failed-messages", query: { groupBy: classifier } });

  classificationHelper.saveDefaultGroupingClassifier(classifier);

  emit("classifierUpdated", classifier);
}

function sortUpdated(sort) {
  selectedSort.value = sort.description + (sort.dir == "desc" ? " (Descending)" : "");
  sortingHelper.saveSortOption(sort.description, sort.dir);

  sort.sort = sortingHelper.getSortFunction(sort.selector, sort.dir);

  emit("sortUpdated", sort);
}

function setSortOptions() {
  const savedSort = sortingHelper.loadSavedSortOption();
  selectedSort.value = savedSort.description + (savedSort.dir == "desc" ? " (Descending)" : "");

  emit("sortUpdated", savedSort);
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

function loadClassifier() {
  // if ($routeParams.groupBy) {
  //   saveSelectedClassification($routeParams.groupBy);
  //   return $routeParams.groupBy;
  // }

  // var storedClassification = $cookies.get("failed_groups_classification");

  // if (typeof storedClassification === "undefined") {
  //   return classifiers[0];
  // }
  // var storedClassification = cookies.get("failed_groups_classification");

  // return storedClassification;
}

onMounted(() => {
  setSortOptions();

  getGroupingClassifiers().then(() => {
    let savedClassifier = classificationHelper.loadDefaultGroupingClassifier(route);

    if (!savedClassifier) {
      savedClassifier = classifiers.value[0];
    }

    selectedClassifier.value = savedClassifier;
  });
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
        <a @click.prevent="classifierChanged(classifier)">{{ classifier }}</a>
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
