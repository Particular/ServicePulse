<script setup>
import { computed, inject, onBeforeMount, watch } from "vue";

const addTab = inject("addTab");
const activeTab = inject("activeTab");
const updateTab = inject("updateTab");

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  header: {
    type: String,
    required: true,
  },
});

watch(
  () => Object.assign({}, props),
  () => updateTab(props.id, props.header)
);

onBeforeMount(() => {
  addTab(props.id, props.header);
});

const isActive = computed(() => activeTab.value === props.id);
</script>

<template>
  <section v-if="isActive">
    <slot />
  </section>
</template>
