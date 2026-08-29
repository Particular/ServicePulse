<script setup lang="ts">
import NoData from "@/components/NoData.vue";
import CustomCheckView from "@/components/customchecks/CustomCheckView.vue";
import { storeToRefs } from "pinia";
import PaginationStrip from "@/components/PaginationStrip.vue";
import useCustomChecksStoreAutoRefresh from "@/composables/useCustomChecksStoreAutoRefresh";

const { store } = useCustomChecksStoreAutoRefresh();

const { pageNumber, failingCount, failedChecks, showPlatformCustomChecks } = storeToRefs(store);
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-12 padded page-header-row">
        <h1>Custom checks</h1>
        <label class="show-platform-toggle">
          <input v-model="showPlatformCustomChecks" type="checkbox" aria-label="Show platform custom checks" />
          <span>Show platform custom checks</span>
        </label>
      </div>
    </div>

    <section name="custom_checks">
      <NoData v-if="failingCount === 0" message="No failed custom checks" role="note" aria-label="customcheck-message" />
      <div v-else class="row" role="table" aria-label="custom-check-list">
        <div class="col-sm-12">
          <CustomCheckView v-for="item of failedChecks" :key="item.id" :custom-check="item" />
          <div class="row">
            <PaginationStrip :items-per-page="10" :total-count="failingCount" v-model="pageNumber" role="row" aria-label="custom-check-pagination" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.show-platform-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 400;
  font-size: 14px;
  margin: 0;
}

@media (max-width: 600px) {
  .page-header-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
