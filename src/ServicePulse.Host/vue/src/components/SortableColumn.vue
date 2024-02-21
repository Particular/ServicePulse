<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  unit: String,
  sortBy: {
    type: String,
    required: true,
  },
});

const activeColumn = defineModel({
  type: String,
  required: true,
});

const emit = defineEmits(["isAscending"]);

const isAscending = ref(false);
const isActive = computed(() => activeColumn.value === props.sortBy);
const sortIcon = computed(() => (isAscending.value ? "sort-up" : "sort-down"));

function toggleSort() {
  activeColumn.value = props.sortBy;
  isAscending.value = isActive.value ? !isAscending.value : false;
  emit("isAscending", isAscending.value);
}
</script>
<template>
  <div class="box-header">
    <button v-if="props.sortBy" @click="toggleSort" class="column-header-button">
      <span>
        <slot></slot>
        <span class="table-header-unit"><slot name="unit"></slot></span>
        <span>
          <i v-if="isActive" :class="sortIcon"></i>
        </span>
      </span>
    </button>
    <div v-else class="column-header">
      <span>
        <slot></slot>
        <span class="table-header-unit"><slot name="unit"></slot></span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.column-header {
  background: none;
  border: none;
  padding: 0;
  cursor: default;
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
}
.column-header-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.column-header-button span {
  text-transform: uppercase;
  display: inline-block;
  text-align: left;
}

.column-header-button:hover span {
  text-decoration: underline;
}

.column-header-button div {
  display: inline-block;
}

.sort-up {
  background-image: url("../assets/sort-up.svg");
}

.sort-down {
  background: url("../assets/sort-down.svg");
}

.sort-up,
.sort-down {
  background-repeat: no-repeat;
  display: inline-block;
  vertical-align: middle;
}
</style>
