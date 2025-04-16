<script setup lang="ts">
import FilterInput from "@/components/FilterInput.vue";
import { ref, watch } from "vue";
const selected = defineModel<string>({ required: true });
const props = defineProps<{ items: string[]; instructions: string; itemName: string; label: string; defaultEmptyText: string; showClear: boolean; showFilter: boolean }>();
const filter = ref("");
const filteredItems = ref(props.items);

watch([filter, () => props.items], () => {
  if (filter.value !== "" && filter.value !== null && filter.value !== undefined) {
    filteredItems.value = props.items.filter((item) => item.toLowerCase().includes(filter.value.toLowerCase()));
  } else {
    filteredItems.value = props.items;
  }
});

function onclick(item: string, isSelected: boolean) {
  if (isSelected) {
    selected.value = "";
  } else {
    selected.value = item;
  }
}
</script>

<template>
  <div class="dropdown">
    <label v-if="label" class="control-label" style="float: inherit">{{ label }}:</label>
    <button type="button" :aria-label="label ?? 'open dropdown menu'" class="btn btn-dropdown dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      {{ selected ? selected : defaultEmptyText }}
    </button>
    <div class="dropdown-menu wrapper">
      <div class="instructions">{{ instructions }}</div>
      <div v-if="showFilter" class="filter-input">
        <FilterInput v-model="filter" :placeholder="`Filter ${itemName}s`" />
      </div>
      <div class="items-container">
        <div class="item-container" v-if="showClear && selected">
          <svg class="fa-cross" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
            <path
              d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
            />
          </svg>
          <a class="clear" @click.prevent="() => onclick('', true)"> Clear selected {{ itemName }}</a>
        </div>
        <div class="item-container" v-for="item in filteredItems" :key="item">
          <i v-if="item === selected" class="fa fa-check" />
          <a class="item" :class="{ selected: item === selected }" @click.prevent="() => onclick(item, item === selected)">{{ item }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  padding: 0.5em;
  min-width: 200px;
}
.instructions {
  font-weight: bold;
  margin-bottom: 0.5em;
}
.items-container {
  max-height: 300px;
  overflow-y: auto;
}
.item {
  margin-left: 20px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  color: #262626;
  text-decoration: none;
}
.item-container {
  padding: 0.3em 0;
}

.item-container:hover {
  background-color: #f5f5f5;
}

.filter-input {
  margin-bottom: 0.5em;
}

.clear {
  color: #262626;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  text-decoration: none;
}

.selected {
  margin-left: 6px;
}

.fa-cross {
  width: 16px;
  height: 16px;
}
</style>
