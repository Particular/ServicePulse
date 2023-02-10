<script setup>
import { ref, onMounted } from "vue";
import NoData from "../NoData.vue";
import { useFetchFromServiceControl } from "../../composables/serviceServiceControlUrls";

const historicOperations = ref([]);
const showHistoricRetries = ref(false);

function getHistoricOperations() {
  return useFetchFromServiceControl("recoverability/history")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      historicOperations.value = [];
      historicOperations.value = data.historic_operations;
    });
}

onMounted(() => {
  getHistoricOperations();
});
</script>

<template>
  <div class="lasttenoperations">
    <div class="row">
      <div class="col-sm-12 list-section">
        <h6>
          <span
            class="no-link-underline"
            aria-hidden="true"
            v-show="showHistoricRetries"
            ><i class="fa fa-angle-down" aria-hidden="true"></i>
          </span>
          <span
            class="fake-link"
            aria-hidden="true"
            v-show="!showHistoricRetries"
            ><i class="fa fa-angle-right" aria-hidden="true"></i>
          </span>
          <a v-on:click="showHistoricRetries = !showHistoricRetries"
            >Last 10 completed retry requests</a
          >
        </h6>
      </div>
    </div>

    <div class="row">
      <div
        class="col-sm-12 no-mobile-side-padding"
        v-show="showHistoricRetries"
      >
        <no-data
          v-if="historicOperations.length === 0"
          title="message group retries"
          message="No group retry requests have ever been completed"
        ></no-data>
        <div
          class="row box extra-box-padding repeat-modify"
          v-for="(group, index) in historicOperations"
          :key="index"
          v-show="historicOperations.length"
        >
          <div class="col-sm-12 no-mobile-side-padding">
            <div class="row">
              <div class="col-sm-12 no-side-padding">
                <div class="row box-header">
                  <div class="col-sm-12 no-side-padding">
                    <p class="lead break"></p>
                  </div>
                </div>

                <div class="row">
                  <div class="col-sm-12 no-side-padding">
                    <p class="metadata">
                      <span class="metadata"
                        ><i aria-hidden="true" class="fa fa-envelope"></i>
                        Messages sent:
                      </span>
                      <span class="metadata"
                        ><i aria-hidden="true" class="fa fa-clock-o"></i> Retry
                        request started:
                        <sp-moment date="{{group.start_time}}"></sp-moment
                      ></span>
                      <span class="metadata"
                        ><i aria-hidden="true" class="fa fa-clock-o"></i> Retry
                        request completed:
                        <sp-moment date="{{group.completion_time}}"></sp-moment
                      ></span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <span
          class="short-group-history"
          ng-show="vm.historicGroups.length === 1"
          >There is only 1 completed group retry</span
        >
        <span
          class="short-group-history"
          ng-show="vm.historicGroups.length < 10 && vm.historicGroups.length > 1"
          >There are only ## completed group retries</span
        >
      </div>
    </div>
  </div>
</template>

<style>
.fake-link i {
  padding-right: 0.2em;
}

.lasttenoperations {
  padding-bottom: 2em;
}
</style>
