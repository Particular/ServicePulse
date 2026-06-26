<script setup lang="ts">
// Wraps an action (button or link) so that, when the current user is not allowed to use it,
// it stays visible but reads as disabled and shows a tooltip explaining why, instead of
// silently failing server-side.
//
// The consumer still disables the inner control (so it gets the native disabled state and
// any other disable conditions still apply); this wrapper adds the tooltip, lets pointer
// events reach the wrapper so the tooltip shows even over a disabled button, and tidies the
// disabled look of link-style buttons.
interface Props {
  allowed: boolean;
  reason?: string;
}
withDefaults(defineProps<Props>(), { reason: "" });
</script>

<template>
  <span class="permission-gate" :class="{ denied: !allowed }" v-tippy="!allowed ? reason : ''">
    <slot />
  </span>
</template>

<style scoped>
.permission-gate {
  display: inline-flex;
}

.permission-gate.denied {
  cursor: not-allowed;
}

/* Let pointer events reach the wrapper so its tooltip shows even though the button is disabled. */
.permission-gate.denied :deep(.btn) {
  pointer-events: none;
}

/* A permission-disabled link should read as disabled: gray, without the default button box. */
.permission-gate.denied :deep(.btn-link),
.permission-gate.denied :deep(.btn-link .button-text) {
  color: #6c757d;
  opacity: 1;
  background-color: transparent;
  border-color: transparent;
}
</style>
