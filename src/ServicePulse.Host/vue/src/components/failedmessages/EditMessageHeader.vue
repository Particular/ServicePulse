<script setup>
import { ref, watch, computed, onMounted } from "vue";

const settings = defineProps({
  header: Object,
});

let origHeaderValue = undefined;
const header = ref(settings.header);

const headerValue = computed(() => settings.header.value);
watch(headerValue, async (newValue) => {
  header.value.isChanged = newValue !== origHeaderValue ? true : false;
});

function resetHeaderValue() {
  header.value.value = origHeaderValue;
}

onMounted(() => {
  origHeaderValue = settings.header.value;
});
</script>

<template>
  <td nowrap="nowrap">
    {{ settings.header.key }}
    <span v-if="header.isLocked">
      &nbsp;
      <i class="fa fa-lock" tooltip="Protected system header"></i>
    </span>
    <span v-if="(header.isChanged || header.isMarkedAsRemoved) && header.isSensitive">
      &nbsp;
      <i class="fa fa-exclamation-triangle" uib-tooltip="This is a sensitive message header that if changed can the system behavior. Proceed with caution."></i>
    </span>
    <span v-if="header.isChanged">
      &nbsp;
      <i class="fa fa-pencil" tooltip="Edited"></i>
    </span>
  </td>
  <td>
    <input class="form-control" :disabled="header.isLocked" v-model="header.value" />
  </td>
  <td>
    <a v-if="!settings.header.isLocked" href="#">
      <i class="fa fa-trash" tooltip="Protected system header"></i>
    </a>
    <a v-if="header.isChanged" href="#" @click="resetHeaderValue()">
      <i class="fa fa-undo" tooltip="Protected system header"></i>
    </a>
  </td>
</template>
