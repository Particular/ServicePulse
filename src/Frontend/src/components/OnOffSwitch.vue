<script setup lang="ts">
import ValueToggle from "./ValueToggle.vue";
defineProps<{
  id: string;
}>();

const model = defineModel<boolean | null>({ required: true });
const emit = defineEmits<{ toggle: [] }>();
</script>

<template>
  <ValueToggle :id="id" value1="OFF" value2="ON" width="76px" @toggle="emit('toggle')" v-model="model" />
</template>
