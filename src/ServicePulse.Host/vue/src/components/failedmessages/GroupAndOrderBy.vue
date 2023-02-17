<script setup>
import { ref, onMounted } from "vue";
import { useFetchFromServiceControl } from "../../composables/serviceServiceControlUrls";

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
    <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      vm.selecteasddClassification
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu">
      <li v-for="(classifier, index) in classifiers" :key="index">
        <a href="#/failed-messages/groups?groupBy={{classifier}}">{{ classifier }}</a>
      </li>
    </ul>
  </div>

  <div class="msg-group-menu dropdown">
    <label class="control-label">Sort by:</label>
    <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      vm.selectedSort
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu">
      <span v-for="(sort, index) in sortOptions" :key="index">
        <li>
          <a href="#/failed-messages/groups?sortBy={{sort.description}}">{{ sort.description }}</a>
        </li>
        <li>
          <a href="#/failed-messages/groups?sortBy={{sort.description}}&sortdir=desc">{{ sort.description }}<span> (Descending)</span></a>
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