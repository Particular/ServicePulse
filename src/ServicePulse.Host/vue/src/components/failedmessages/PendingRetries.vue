<script setup>
import { ref, onMounted } from "vue";
import { licenseStatus } from "../../composables/serviceLicense.js";
import { connectionState } from "../../composables/serviceServiceControl.js";
import { useEndpoints } from "../../composables/serviceEndpoints";
import LicenseExpired from "../../components/LicenseExpired.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";

const endpoints = ref(["Test", "Meow"]);

const selectedQueue = ref("empty");

function loadEndpoints() {
  const loader = new useEndpoints();
  loader.getQueueNames().then((queues) => {
    endpoints.value = queues.map((endpoint) => endpoint.physical_address);
  });
}

function clearSelectedQueue() {
  selectedQueue.value = "empty";
}

onMounted(() => {
  loadEndpoints();
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <ServiceControlNotAvailable />
    <template v-if="!connectionState.unableToConnect">
      <section name="pending_retries">
        <div class="row">
          <div class="col-12">
            <div class="alert alert-info"><i class="fa fa-info-circle"></i> To check if a retried message was also processed successfully, enable <a href="https://docs.particular.net/nservicebus/operations/auditing" target="_blank">message auditing</a> <i class="fa fa-external-link fake-link"></i></div>
          </div>
        </div>
        <div class="row">
          <div class="col-6">
            <div class="filter-input">
              <div class="input-group mb-3">
                <label class="input-group-text"><i class="fa fa-filter" aria-hidden="true"></i> <span class="hidden-xs">Filter</span></label>
                <select class="form-select" id="inputGroupSelect01" onchange="this.dataset.chosen = true;" v-model="selectedQueue">
                  <option selected disabled hidden class="placeholder" value="empty">Select a queue...</option>
                  <option v-for="(endpoint, index) in endpoints" :key="index" :value="endpoint">{{ endpoint }}</option>
                </select>
                <span class="input-group-btn">
                  <button type="button" @click="clearSelectedQueue()" class="btn btn-default"><i class="fa fa-times" aria-hidden="true"></i></button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-6 col-xs-12 toolbar-menus">
            <div class="action-btns">
                <button type="button" class="btn btn-default" disabled confirm-title="Are you sure you want to retry the selected messages?" confirm-message="Ensure that the selected messages were not processed previously as this will create a duplicate message." confirm-second-paragraph="NOTE: If the selection includes messages to be processed via unaudited endpoints, those messages will need to be marked as resolved once the retry is manually verified." confirm-click="vm.retrySelected()" ng-disabled="vm.selectedIds.length == 0"><i class="fa fa-repeat"></i> <span>Retry</span> (0)</button>
                <button type="button" class="btn btn-default" confirm-title="Are you sure you want to mark as resolved the selected messages?" confirm-message="If you mark these messages as resolved they will not be available for Retry. Messages should only be marked as resolved only if they belong to unaudited endpoints." confirm-click="vm.markAsResolvedSelected()" ng-disabled="vm.selectedIds.length == 0"><i class="fa fa-check-square-o"></i> <span>Mark as resolved</span> (0)</button>
                <button type="button" class="btn btn-default" ng-disabled="vm.filteredTotal === '0'" confirm-title="vm.retryAllConfirmationTitle()" confirm-message="vm.retryAllConfirmationMessage()" confirm-click="vm.retryAll()" confirm-ok-only="vm.isQueueFilterEmpty()"><i class="fa fa-repeat"></i> <span>Retry all</span> (0)</button>
                <button type="button" class="btn btn-default" ng-disabled="vm.filteredTotal === '0'" confirm-message="Are you sure you want to mark as resolved all vm.filteredTotal retried messages out of vm.total? If you do they will not be available for Retry. vm.filteredTotal < vm.total ? 'If you want to mark as resolved all clear the filtering.' : ''" confirm-click="vm.markAsResolvedAll()"><i class="fa fa-check-square-o"></i> <span>Mark all as resolved</span> (0)</button>
            </div>
          </div>
        </div>
      </section>
    </template>
  </template>
</template>

<style>
.input-group-text {
  margin-bottom: 0;
}

.input-group-text > span {
  font-size: 14px;
  padding-left: 5px;
  color: #555;
}

.input-group > select {
  font-size: 14px;
  color: #777777;
}

.input-group > select[data-chosen="true"] {
  color: #212529;
}

.input-group > select:hover {
  box-shadow: 0 0 10px 100px var(--bs-btn-hover-bg) inset;
  color: #212529;
}

.input-group-btn:last-child > .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.action-btns > .btn {
  margin-right: 5px;
}
</style>