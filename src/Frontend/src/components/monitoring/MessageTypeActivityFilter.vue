<script setup lang="ts">
export interface ActivityFilterOption {
  value: number;
  text: string;
}

const filterOptions: ActivityFilterOption[] = [
  { value: 0, text: "All" },
  { value: 1, text: "1 min" },
  { value: 5, text: "5 min" },
  { value: 15, text: "15 min" },
];

const selected = defineModel<number>({ default: 0 });
</script>

<template>
  <div class="activity-filter">
    <span class="activity-filter-label">Show active in the last:</span>
    <ul aria-label="activity-filter-list" class="nav nav-pills activity-filter-pills">
      <li v-for="option in filterOptions" :key="option.value" :class="{ active: option.value === selected }" :aria-selected="option.value === selected">
        <a href="#" @click.prevent="selected = option.value">{{ option.text }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.activity-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0 8px;
}

.activity-filter-label {
  font-size: 13px;
  color: #8c8c8c;
  white-space: nowrap;
}

.nav-pills.activity-filter-pills > li > a {
  border-radius: 0;
  border-bottom: 3px solid transparent;
  padding: 6px 8px;
  font-size: 13px;
  color: #00a3c4;
}

.nav-pills.activity-filter-pills > li > a:hover {
  color: #00a3c4;
  font-weight: normal;
  background-color: initial;
  border-bottom-color: #00a3c4;
  text-decoration: none;
}

.nav-pills.activity-filter-pills > li.active > a,
.nav-pills.activity-filter-pills > li.active > a:hover,
.nav-pills.activity-filter-pills > li.active > a:focus {
  color: #000;
  font-weight: bold;
  background-color: initial;
  border-bottom-color: #000;
}

.nav li {
  display: flex;
}

.nav-pills > li + li {
  margin-left: 2px;
}
</style>
