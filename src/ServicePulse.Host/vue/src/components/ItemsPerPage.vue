<script setup>
defineProps({
  options: {
    type: Array,
    default: () => [20, 35, 50, 75],
  },
  current: {
    type: Number,
    default: 50,
  },
});

const emit = defineEmits(["changed"]);

function changeItemsPerPage(option) {
  emit("changed", option);
}
</script>

<template>
  <div class="pagination col-md-2">
    <div class="dropdown">
      <label class="control-label">Items Per Page:</label>
      <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        {{ current }}
        <span class="caret" />
      </button>
      <ul class="dropdown-menu">
        <li v-for="option of options" :key="option">
          <a @click.prevent="changeItemsPerPage(option)" href="#">{{ option }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>
