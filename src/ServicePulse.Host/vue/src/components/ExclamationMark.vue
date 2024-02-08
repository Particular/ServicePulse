<script setup lang="ts">
import { LicenseWarningLevel } from "@/composables/LicenseStatus";

const props = withDefaults(
  defineProps<{
    type?: LicenseWarningLevel;
  }>(),
  { type: LicenseWarningLevel.None }
);
</script>

<template>
  <template v-if="props.type !== LicenseWarningLevel.None">
    <span class="fa fa-exclamation-triangle" :class="props.type"></span>
  </template>
</template>
