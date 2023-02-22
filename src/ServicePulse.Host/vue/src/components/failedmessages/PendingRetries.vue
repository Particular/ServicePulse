<script setup>
import { licenseStatus } from "../../composables/serviceLicense.js";
import LicenseExpired from "../../components/LicenseExpired.vue";
import { connectionState } from "../../composables/serviceServiceControl.js";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
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
                                      <option value="1">One</option>
                                      <option value="2">Two</option>
                                      <option value="3">Three</option>
                                    </select>

                                    <!-- <ui-select ng-model="vm.filter.searchPhrase" theme="bootstrap" on-select="vm.searchPhraseChanged()">
                                        <ui-select-match placeholder="Select a queue...">
                                            <span ng-bind="$select.selected.physical_address"></span>
                                        </ui-select-match>
                                        <ui-select-choices repeat="item in vm.endpoints | filter: $select.search">
                                            <span ng-bind-html="item.physical_address | highlight: $select.search"></span>
                                        </ui-select-choices>
                                    </ui-select> -->
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