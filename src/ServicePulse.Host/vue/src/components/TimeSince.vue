<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import moment from "moment";

const props = defineProps({
  dateUtc: String,
  default: function () {
    return "0001-01-01T00:00:00";
  },
});

var interval = null;
const title = ref();
const text = ref();

 function updateText() {

    if (props.dateUtc) {
        const m = moment.utc(props.dateUtc);
        text.value = m.fromNow();
        title.value =
            m.local().format("LLLL") + " (local)\n" + m.utc().format("LLLL") + " (UTC)";
    }
    else {
        text.value = "never";
        title.value = "never";
    }
}

onMounted(() => {
  interval = setInterval(function () {
    updateText();
  }, 5000);
  updateText();
});

onUnmounted(() => clearInterval(interval));
</script>

<template>
  <span :title="title">{{ text }}</span>
</template>

<style></style>
