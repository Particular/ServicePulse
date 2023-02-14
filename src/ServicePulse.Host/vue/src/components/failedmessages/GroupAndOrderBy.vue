<script setup>
import { ref, onMounted } from "vue";
import { useFetchFromServiceControl } from "../../composables/serviceServiceControlUrls";
import "bootstrap";

const classifiers = ref([]);
const sortOptions = [
  {
    description: "Name",
    selector: function (group) {
      return group.title;
    },
  },
  {
    description: "Number of messages",
    selector: function (group) {
      return group.count;
    },
  },
  {
    description: "First Failed Time",
    selector: function (group) {
      return group.first;
    },
  },
  {
    description: "Last Failed Time",
    selector: function (group) {
      return group.last;
    },
  },
  {
    description: "Last Retried Time",
    selector: function (group) {
      return group.last_operation_completion_time;
    },
  },
];

function getGroupingClassifiers() {
  return useFetchFromServiceControl("recoverability/classifiers")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      classifiers.value = data;
    });
}

onMounted(() => {
  getGroupingClassifiers();
});
</script>

<template>
  <div class="msg-group-menu dropdown">
    <label class="control-label">Group by:</label>
    <button
      type="button"
      class="btn btn-default dropdown-toggle sp-btn-menu"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >
      vm.selectedClassification
      <span class="caret"></span>
    </button>
    <div v-for="(classifier, index) in classifiers" :key="index">
      {{ classifier }}
    </div>
    <ul class="dropdown-menu">
      <li ng-repeat="classifier in vm.availableClassifiers">
        <a href="#/failed-messages/groups?groupBy={{classifier}}">classifier</a>
      </li>
    </ul>
  </div>

  <div class="msg-group-menu dropdown">
    <label class="control-label">Sort by:</label>
    <button
      type="button"
      class="btn btn-default dropdown-toggle sp-btn-menu"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >
      vm.selectedSort
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu">
      <span v-for="(sort, index) in sortOptions" :key="index">
        <li>
          <a href="#/failed-messages/groups?sortBy={{sort.description}}">{{
            sort.description
          }}</a>
        </li>
        <li>
          <a
            href="#/failed-messages/groups?sortBy={{sort.description}}&sortdir=desc"
            >{{ sort.description }}<span> (Descending)</span></a
          >
        </li>
      </span>
    </ul>
  </div>
</template>
