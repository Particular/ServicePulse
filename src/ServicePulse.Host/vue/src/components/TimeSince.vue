<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import moment from "moment";

const props = defineProps({
  date: String,
  default: function () {
    return "0001-01-01T00:00:00";
  },
});

var interval = null;
const title = ref(),
  text = ref();

function updateText() {
  const m = moment(props.date);
  text.value = m.fromNow();
  title.value =
    m.format("LLLL") + " (local)\n" + m.utc().format("LLLL") + " (UTC)";
}

onMounted(() => {
  interval = setInterval(function () {
    updateText();
  }, 5000);
  if (props.date) {
    updateText();
  }
});

onUnmounted(() => clearInterval(interval));
</script>

<template>
  <span :title="title">{{ text }}</span>
</template>

<style></style>
