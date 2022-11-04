<script setup>
defineProps({
  type:String
})
</script>

<template v-if="type != ''">
  <span class="fa fa-exclamation-triangle {{type}}"></span>
</template>
