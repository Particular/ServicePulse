<script setup>
import { ref, onMounted } from "vue";
import { useCookies } from "vue3-cookies";
import { useMonitoringStore } from "../../stores/MonitoringStore";

const monitoringStore = useMonitoringStore();
const cookies = useCookies().cookies;
const grouping = ref(monitoringStore.grouping);

async function selectGroup(groupSize) {
  saveSelectedGroup(groupSize);
  await monitoringStore.updateSelectedGrouping(groupSize);
}

function saveSelectedGroup(groupSize) {
  cookies.set(`selected_group_size`, groupSize);
}

function getDefaultSelectedGroup() {
  const storedGroupSelection = cookies.get("selected_group_size");
  if (storedGroupSelection != null && !isNaN(parseInt(storedGroupSelection))) {
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
  <div class="dropdown" v-tooltip title="Endpoint grouping will take '.' in endpoint names to delimit segments. Grouping endpoints will disable some list sorting.">
    <label class="control-label">Group by:</label>
    <button type="button" class="btn btn-dropdown dropdown-toggle sp-btn-menu" id="dropdownMenu1" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      {{ grouping.selectedGrouping === 0 ? "no grouping" : "max. " + grouping.selectedGrouping + " segments" }}
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

<style scoped>
.dropdown {
  margin-left: 25px;
  width: 250px;
}

.dropdown .dropdown-menu {
  top: 36px;
  margin-left: 72px;
}

.btn.btn-dropdown {
  padding: 8px 16px;
  padding-top: 8px;
  padding-right: 16px;
  padding-bottom: 8px;
  padding-left: 16px;
}

.btn.dropdown-toggle::after {
  vertical-align: middle;
}

ul.dropdown-menu li a span {
  color: #aaa;
}
</style>
