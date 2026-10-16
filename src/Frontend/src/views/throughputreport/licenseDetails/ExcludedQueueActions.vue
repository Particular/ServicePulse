<script setup lang="ts">
import FAIcon from "@/components/FAIcon.vue";
import type { Queue } from "@/resources/LicenseDetails";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

const props = defineProps<{ queue: Queue }>();

const store = useLicenseDetailsStore();
const { unexcludeQueue } = store;

function include() {
  unexcludeQueue(props.queue);
}
</script>

<template>
  <div class="input-group queue-controls">
    <button class="btn btn-secondary" type="button" v-tippy="`Return to Unassigned Queues`" @click="include">
      <FAIcon :icon="faCircleXmark" />
    </button>
  </div>
</template>

<style scoped>
.queue-controls {
  display: block;
  width: max-content;
}
</style>
