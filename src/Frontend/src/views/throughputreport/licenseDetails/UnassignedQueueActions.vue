<script setup lang="ts">
import FAIcon from "@/components/FAIcon.vue";
import { faArrowRightToBracket, faCircleMinus, faCirclePlus, faGear } from "@fortawesome/free-solid-svg-icons";

function exclude() {}
function addToNew() {}
function markAsInfrastructure() {}
</script>

<template>
  <div class="input-group queue-controls">
    <button class="btn btn-secondary" type="button" v-tippy="'Not an endpoint queue'" @click="exclude">
      <FAIcon :icon="faCircleMinus" />
    </button>

    <button class="btn btn-secondary" type="button" v-tippy="'Mark as Particular infrastructure'" @click="markAsInfrastructure"><FAIcon :icon="faGear" /></button>

    <button class="btn btn-secondary" type="button" v-tippy="'Create endpoint from queue'" @click="addToNew"><FAIcon :icon="faCirclePlus" /></button>

    <!-- <button class="btn btn-secondary" type="button" data-bs-toggle="modal" data-bs-target="#availableEndpoints" title="Add queue to endpoint" @click="setSelectedQueue(queue)">
      <i class="bi bi-sign-merge-left"></i>
    </button> -->
    <button class="btn btn-secondary" type="button" data-bs-toggle="modal" data-bs-target="#availableEndpoints" v-tippy="'Add queue to endpoint'">
      <i class="bi bi-sign-merge-left"></i>
      <FAIcon :icon="faArrowRightToBracket" />
    </button>
  </div>
</template>

<style scoped>
.queue-controls {
  display: block;
  width: max-content;
}
</style>
