<script setup lang="ts">
const props = defineProps({
  type: String,
});
</script>

<template>
  <template v-if="props.type">
    <span class="fa fa-exclamation-triangle" :class="type"></span>
  </template>
</template>
