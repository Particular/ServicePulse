<script setup>
const props = defineProps({
  type: String,
  title: String,
  message: String,
});
</script>

<template>
  <div class="toast-container">
    <template v-if="props.type === 'success'">
      <div class="toast-success">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
    <template v-if="props.type === 'info'">
      <div class="toast-info">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
    <template v-if="props.type === 'error'">
      <div class="toast-error">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
    <template v-if="props.type === 'warning'">
      <div class="toast-warning">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
    <template v-if="props.type === 'default'">
      <div class="toast-default">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
  </div>
</template>
