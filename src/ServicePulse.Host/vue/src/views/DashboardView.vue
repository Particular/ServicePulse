<script setup lang="ts">
import { ref } from "vue";
import PaginationStrip from "@/components/PaginationStrip.vue";
const pageNumber = ref(1);
</script>

<template>
  <h1>{{ pageNumber }}</h1>
  <PaginationStrip v-model="pageNumber" :total-count="500" :items-per-page="10" :pageBuffer="5" />
</template>
