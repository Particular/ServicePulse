<script setup>
defineProps({
  unit: String,
});
</script>
<template>
  <div class="box-header">
    <button ng-click="vm.toggleSort()">
      <span>
        <slot></slot> &nbsp;
        <span class="table-header-unit"><slot name="unit"></slot></span>
      </span>
      <div>
        <!-- <i class="fa fa-sort-down" aria-hidden="true"></i> -->
        <!-- <i class="bi bi-sort-down"></i> -->
      </div>
    </button>
  </div>
</template>
