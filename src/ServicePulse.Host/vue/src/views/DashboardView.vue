<script setup lang="ts">
import { ref } from "vue";
import PaginationStrip from "@/components/PaginationStrip.vue";
const pageNumber = ref(1);
</script>

<template>
  <h1>Hola</h1>
  <PaginationStrip v-model="pageNumber" :total-count="100" :items-per-page="1" :pageBuffer="0" />
</template>
