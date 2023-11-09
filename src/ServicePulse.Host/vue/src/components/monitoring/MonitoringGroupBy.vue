<script setup>
import { ref, onMounted } from "vue";
import { useCookies } from "vue3-cookies";
import { useFindEndpointSegments, useGroupEndpoints } from "../../composables/serviceMonitoringEndpoints";

const emit = defineEmits(["group-selector"]);
const settings = defineProps({
  endpoints: Object,
});

const cookies = useCookies().cookies;
const endpoints = ref(settings.endpoints);
const grouping = ref({
  groupedEndpoints: [],
  groupSegments: useFindEndpointSegments(endpoints),
  selectedGrouping: 0,
});

function selectGroup(groupSize) {
  grouping.value.selectedGrouping = groupSize;
  saveSelectedGroup(groupSize);
  grouping.value.groupedEndpoints = useGroupEndpoints(endpoints, groupSize);
  emit("group-selector", grouping);
}

function saveSelectedGroup(groupSize) {
  cookies.set(`selected_group_size`, groupSize);
}

function getDefaultSelectedGroup() {
  const storedGroupSelection = cookies.get("selected_group_size");
  if (storedGroupSelection !== "undefined" && !isNaN(storedGroupSelection)) {
    selectGroup(parseInt(storedGroupSelection));
  } else {
    selectGroup(0);
  }
}

onMounted(() => {
  getDefaultSelectedGroup();
});
</script>

<template>
  <div class="dropdown" v-tooltip title="Endpoint grouping will take '.' in endpoint names to delimit segments. Grouping endpoints will disable list sorting.">
    <label class="control-label">Group by:</label>
    <button type="button" class="btn dropdown-toggle sp-btn-menu" id="dropdownMenu1" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      {{ grouping.selectedGrouping === 0 ? "no grouping" : "max. " + grouping.selectedGrouping + " segments" }}
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
      <li><a href="#" @click.prevent="selectGroup(0)">no grouping</a></li>
      <li role="separator" class="divider"></li>
      <li v-for="segment in grouping.groupSegments" :key="segment">
        <a href="#" @click.prevent="selectGroup(segment)">max. {{ segment }} segments</a>
      </li>
    </ul>
  </div>
</template>
