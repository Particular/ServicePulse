<script setup>
import { ref, watch } from "vue";

const emit = defineEmits(["group-selector"]);
const settings = defineProps({
  endpoints: Object,
});
const endpoints = ref(settings.endpoints);

const grouping = ref({
  groupedEndpoints: [],
  groupSegments: findSegments(endpoints),
  selectedGrouping: 0,
});

watch(endpoints, async () => {
  grouping.value.groupSegments = findSegments(endpoints);
  grouping.value.groupedEndpoints = groupEndpoints(endpoints, grouping.value.selectedGrouping);
});

function selectGroup(groupSize) {
  grouping.value.selectedGrouping = groupSize;
  grouping.value.groupedEndpoints = groupEndpoints(endpoints, groupSize);
  emit("group-selector", grouping.value);
}

function groupEndpoints(endpoints, numberOfSegments) {
  let groups = new Map();
  if (endpoints.value === undefined) return;
  endpoints.value.forEach(function (element) {
    const grouping = parseEndpoint(element, numberOfSegments);

    let resultGroup = groups.get(grouping.groupName);
    if (!resultGroup) {
      resultGroup = {
        group: grouping.groupName,
        endpoints: [],
      };
      groups.set(grouping.groupName, resultGroup);
    }
    resultGroup.endpoints.push(grouping);
  });
  return [...groups.values()];
}

function findSegments(endpoints) {
  if (endpoints.value !== undefined) {
    return endpoints.value.reduce(function (acc, cur) {
      return Math.max(acc, cur.name.split(".").length - 1);
    }, 0);
  }
  return 0;
}

function parseEndpoint(endpoint, maxGroupSegments) {
  if (maxGroupSegments === 0) {
    return {
      groupName: "Ungrouped",
      shortName: endpoint.name,
      endpoint: endpoint,
    };
  }

  const segments = endpoint.name.split(".");
  const groupSegments = segments.slice(0, maxGroupSegments);
  const endpointSegments = segments.slice(maxGroupSegments);
  if (endpointSegments.length === 0) {
    // the endpoint's name is shorter than the group size
    return parseEndpoint(endpoint, maxGroupSegments - 1);
  }

  return {
    groupName: groupSegments.join("."),
    shortName: endpointSegments.join("."),
    endpoint: endpoint,
  };
}
</script>

<template>
  <div class="dropdown">
    <label class="control-label">Group by:</label>
    <button type="button" class="btn dropdown-toggle sp-btn-menu" id="dropdownMenu1" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      {{ grouping.selectedGrouping == 0 ? "no grouping" : "max. " + grouping.selectedGrouping + " segments" }}
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
      <li><a href="#">no grouping</a></li>
      <li role="separator" class="divider"></li>
      <li v-for="segment in grouping.groupSegments" :key="segment">
        <a href="#" @click.prevent="selectGroup(segment)">max. {{ segment }} segments</a>
      </li>
    </ul>
  </div>
</template>
