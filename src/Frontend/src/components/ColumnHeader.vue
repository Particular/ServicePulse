<script setup lang="ts">
import { computed } from "vue";
import type { SortInfo } from "./SortInfo";
import FAIcon from "@/components/FAIcon.vue";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const props = withDefaults(
  defineProps<{
    name: string;
    label: string;
    unit?: string;
    sortable?: boolean;
    sortBy?: string;
    sortState?: SortInfo;
    defaultAscending?: boolean;
    interactiveHelp?: boolean;
  }>(),
  {
    sortable: false,
    defaultAscending: false,
    interactiveHelp: false,
  }
);

const sortByColumn = computed(() => props.sortBy || props.name);
const activeSortColumn = defineModel<SortInfo>();
const isSortActive = computed(() => activeSortColumn?.value?.property === sortByColumn.value);
const sortIcon = computed(() => (activeSortColumn?.value?.isAscending ? "sort-up" : "sort-down"));

function toggleSort() {
  activeSortColumn.value = { property: sortByColumn.value, isAscending: isSortActive.value ? !activeSortColumn?.value?.isAscending : props.defaultAscending };
}
</script>

<template>
  <div role="columnheader" :aria-label="props.name">
    <div class="box-header">
      <button v-if="props.sortable" @click="toggleSort" class="column-header-button" :aria-label="props.name">
        <span>
          {{ props.label }}
          <span v-if="props.unit" class="table-header-unit">{{ props.unit }}</span>
          <span v-if="isSortActive">
            <i role="img" :class="sortIcon" :aria-label="sortIcon"></i>
          </span>
          <tippy v-if="$slots.help" max-width="400px" :interactive="props.interactiveHelp">
            <FAIcon :icon="faInfoCircle" class="info" />
            <template #content>
              <slot name="help" />
            </template>
          </tippy>
        </span>
      </button>
      <div v-else class="column-header">
        <span>
          {{ props.label }}
          <span v-if="props.unit" class="table-header-unit">{{ props.unit }}</span>
        </span>
        <tippy v-if="$slots.help" max-width="400px" :interactive="props.interactiveHelp">
          <FAIcon :icon="faInfoCircle" class="info" />
          <template #content>
            <slot name="help" />
          </template>
        </tippy>
      </div>
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
.column-header span,
.column-header-button span {
  font-size: 0.75rem;
  text-transform: uppercase;
  display: inline-block;
  text-align: left;
}
.column-header-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: end;
}

.column-header-button:hover span {
  text-decoration: underline;
}

.column-header-button div {
  display: inline-block;
}

.sort-up,
.sort-down {
  background-position: center;
  background-repeat: no-repeat;
  width: 8px;
  height: 14px;
  padding: 0;
  margin-left: 10px;
}

.sort-up {
  background-image: url("@/assets/sort-up.svg");
}

.sort-down {
  background: url("@/assets/sort-down.svg");
}

.sort-up,
.sort-down {
  background-repeat: no-repeat;
  display: inline-block;
  vertical-align: middle;
}

.info {
  padding-left: 0.25rem;
  color: var(--info-icon);
}
</style>
