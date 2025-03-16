<script setup lang="ts">
import { Tippy, TippyComponent } from "vue-tippy";
import { ref } from "vue";

const props = defineProps<{
  value: string;
}>();

const tippyRef = ref<TippyComponent | null>(null);
let timeoutId: number;

async function copyToClipboard() {
  await navigator.clipboard.writeText(props.value);
  window.clearTimeout(timeoutId);
  tippyRef.value?.show();
  timeoutId = window.setTimeout(() => tippyRef.value?.hide(), 3000);
}
</script>

<template>
  <Tippy content="Copied" ref="tippyRef" trigger="manual">
    <button type="button" title="Copy To Clipboard" class="btn btn-sm" @click="copyToClipboard"><i class="fa fa-copy"></i></button>
  </Tippy>
</template>
