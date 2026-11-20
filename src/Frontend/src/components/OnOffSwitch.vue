<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string;
    value: boolean | null;
    disabled?: boolean;
  }>(),
  { disabled: false }
);

const emit = defineEmits<{ toggle: [] }>();
</script>

<template>
  <div class="form-check form-switch">
    <input type="checkbox" role="switch" class="form-check-input" :id="`onoffswitch${id}`" :aria-label="id" :disabled="disabled" :checked="value ?? false" @click="emit('toggle')" />
  </div>
</template>

<style scoped>
.form-switch {
  font-size: 1.25rem;
}

/* Bootstrap's off state is below the 3:1 non-text contrast that WCAG 2.2 AA requires. */
.form-switch .form-check-input:not(:checked) {
  border-color: #6c757d;
  --bs-form-switch-bg: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%236c757d'/%3e%3c/svg%3e");
}
</style>
