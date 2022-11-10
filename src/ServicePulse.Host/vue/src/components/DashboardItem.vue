<script setup>
const props = defineProps({
  counter: Number,
  url: String,
  iconClass: String
})
</script>

<template>
  <a class="summary-item" :class="{  'summary-danger'  : counter > 0, 'summary-info' : counter === 0 || !counter }" :href="url">
    <i class="fa fa-3x" :class="iconClass">
    </i>
    <span v-if="counter > 0" class="badge badge-important">{{counter}}</span>
    <h4>
      <slot></slot>
    </h4>  
  </a>
</template>
