<script setup>
const props = defineProps({
  type: String,
  title: String,
  message: String,
});
</script>

<template>
  <div>
    <template v-if="props.type === 'success'">
      <div class="toast-success toast-message">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
    <template v-if="props.type === 'info'">
      <div class="toast-info toast-message">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
    <template v-if="props.type === 'error'">
      <div class="toast-error toast-message">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
    <template v-if="props.type === 'warning'">
      <div class="toast-warning toast-message">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
    <template v-if="props.type === 'default'">
      <div class="toast-default toast-message">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
  </div>
</template>
