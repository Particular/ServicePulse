<script setup>
const props = defineProps({
  type: String,
});
</script>

<template>
  <template v-if="props.type">
    <span class="fa fa-exclamation-triangle {{type}}"></span>
  </template>
</template>
