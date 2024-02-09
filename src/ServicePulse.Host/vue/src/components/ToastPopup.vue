<script setup lang="ts">
import { TYPE } from "vue-toastification";

const props = defineProps<{
  type: TYPE;
  title: string;
  message: string;
}>();
</script>

<template>
  <div>
    <template v-if="props.type === TYPE.SUCCESS">
      <div class="toast-success">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
    <template v-if="props.type === TYPE.INFO">
      <div class="toast-info">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
    <template v-if="props.type === TYPE.ERROR">
      <div class="toast-error">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
    <template v-if="props.type === TYPE.WARNING">
      <div class="toast-warning">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
    <template v-if="props.type === TYPE.DEFAULT">
      <div class="toast-default">
        <p>
          <strong>{{ props.title }}</strong>
        </p>
        <span v-html="props.message"></span>
      </div>
    </template>
  </div>
</template>
