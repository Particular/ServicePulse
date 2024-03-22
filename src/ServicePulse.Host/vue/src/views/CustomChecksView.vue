<script setup lang="ts">
import { ref } from "vue";
import DataView, { AdditionalDataViewParameters } from "@/components/DataView.vue";
import DataViewPageModel from "@/components/DataViewPageModel";
import NoData from "@/components/NoData.vue";
import CustomCheck from "@/resources/CustomCheck";
import CustomCheckView from "@/components/CustomCheckView.vue";

const pageModel = ref<DataViewPageModel<CustomCheck>>({ data: [], totalCount: 0 });
const additionalApiParams: AdditionalDataViewParameters = {
  status: "fail",
};
</script>

<template>
  <div class="container">
    <div class row="row">
      <div class="col-sm-12 padded">
        <h1>Custom checks</h1>
      </div>
    </div>

    <section name="custom_checks">
      <NoData v-if="pageModel.totalCount === 0" message="No failed custom checks" />

      <DataView api-url="customchecks" :api-params="additionalApiParams" v-model="pageModel" :auto-refresh-seconds="5">
        <template #data>
          <div class="row">
            <div class="col-sm-12">
              <div>
                <CustomCheckView v-for="item of pageModel.data" :key="item.id" :customCheck="item" />
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </section>
  </div>
</template>
