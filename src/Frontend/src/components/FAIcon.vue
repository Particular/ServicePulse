<script setup lang="ts">
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

withDefaults(
  defineProps<{
    icon: IconDefinition;
    title?: string;
    size?: "2xs" | "xs" | "sm" | "lg" | "xl" | "2xl" | "1x" | "2x" | "3x" | "4x" | "5x" | "6x" | "7x" | "8x" | "9x" | "10x";
  }>(),
  { size: "1x" }
);
</script>

<template>
  <FontAwesomeIcon v-if="title" :icon="icon" :size="size" focusable="false" v-tippy="title" />
  <FontAwesomeIcon v-else :icon="icon" :size="size" focusable="false" />
</template>
