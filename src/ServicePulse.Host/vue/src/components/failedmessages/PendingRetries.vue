<script setup>
import { ref, onMounted } from "vue";
import { licenseStatus } from "../../composables/serviceLicense.js";
import { connectionState } from "../../composables/serviceServiceControl.js";
import { useEndpoints } from "../../composables/serviceEndpoints"
import LicenseExpired from "../../components/LicenseExpired.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";

const endpoints = ref(["Test", "Meow"]);

function loadEndpoints() {
  const loader = new useEndpoints();
  loader.getQueueNames()
    .then(queues => {
      endpoints.value = queues.map(endpoint => endpoint.physical_address);
    });
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
            <div class="alert alert-info">
              <i class="fa fa-info-circle"></i> To check if a retried message was also processed successfully, enable <a href="https://docs.particular.net/nservicebus/operations/auditing" target="_blank">message auditing</a> <i class="fa fa-external-link fake-link"></i>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-6">
            <div class="filter-input">
              <div class="input-group mb-3">
                <label class="input-group-text"><i class="fa fa-filter" aria-hidden="true"></i> <span class="hidden-xs">Filter</span></label>
                <select class="form-select" id="inputGroupSelect01" onchange="this.dataset.chosen = true;">
                  <option selected disabled hidden class="placeholder">Select a queue...</option>
                  <option v-for="(endpoint, index) in endpoints" :key="index" :value="endpoint">{{ endpoint }}</option>
                </select>
                <span class="input-group-btn">
                  <button type="button" ng-click="vm.clearSearchPhrase()" class="btn btn-default"><i class="fa fa-times" aria-hidden="true"></i></button>
                </span>
              </div>
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

.input-group > select[data-chosen='true'] { 
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
</style>