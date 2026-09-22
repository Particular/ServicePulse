<script setup lang="ts">
import FAIcon from "@/components/FAIcon.vue";
import { type IconDefinition, faExternalLink } from "@fortawesome/free-solid-svg-icons";

defineOptions({
  inheritAttrs: false,
});

withDefaults(
  defineProps<{
    href?: string;
    showIcon?: boolean;
    icon?: IconDefinition;
    iconClass?: string;
    rel?: string;
  }>(),
  {
    showIcon: false,
    icon: () => faExternalLink,
    iconClass: "",
    rel: "noopener noreferrer",
  }
);
</script>

<template>
  <a :href="href" target="_blank" :rel="rel" v-bind="$attrs">
    <slot />
    <FAIcon v-if="showIcon" :icon="icon" :class="iconClass" class="external-link-icon" />
  </a>
</template>

<style scoped>
.external-link-icon {
  margin-left: 0.25rem;
}
</style>
