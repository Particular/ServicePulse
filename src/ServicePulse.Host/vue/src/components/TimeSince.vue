<script setup>
import { onMounted, onUnmounted, watch, ref } from "vue";
import moment from "moment";

const props = defineProps({
  date: Date,
  default: function () { return new Date() }
});

var minDate = "0001-01-01T00:00:00";
var interval = null;
var m;
const title = ref(),
  text = ref();

function updateText() {
  text.value = m.fromNow();
  title.value =
    m.format("LLLL") + " (local)\n" + m.utc().format("LLLL") + " (UTC)";
}

onMounted(() => {
  interval = setInterval(function () {
    updateText();
  }, 5000);
  if (props.date) {
    m = moment(props.date);
    updateText();
  }
});

onUnmounted(() => clearInterval(interval));
</script>

<template>
  <span v-bind:title="title">{{ text }}</span>
</template>

<style></style>
