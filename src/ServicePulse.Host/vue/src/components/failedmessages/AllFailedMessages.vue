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
      <section name="message_groups">
        <div class="row">
          <div class="col-9">
            <div class="btn-toolbar">
              <button type="button" class="btn btn-default select-all" ng-click="vm.selectAllMessages()"><span ng-show="vm.selectedIds.length == 0">Select all</span></button>
              <button type="button" class="btn btn-default" ng-click="vm.retrySelected()" ng-disabled="vm.selectedIds.length == 0"><i class="fa fa-repeat"></i> Retry XX selected</button>
              <button type="button" class="btn btn-default" confirm-title="Are you sure you want to delete the selected messages?" confirm-message="If you delete, these messages won't be available for retrying unless they're later restored." confirm-click="vm.archiveSelected()" ng-disabled="vm.selectedIds.length == 0"><i class="fa fa-trash"></i> Delete XX selected</button>
              <button type="button" class="btn btn-default" ng-click="vm.exportSelected()" ng-disabled="vm.selectedIds.length == 0"><i class="fa fa-download"></i> Export XX selected</button>
              <button type="button" class="btn btn-default" confirm-title="Are you sure you want to retry the whole group?" confirm-message="Retrying a whole group can take some time and put extra load on your system. Are you sure you want to retry all these messages?" confirm-click="vm.retryExceptionGroup(vm.selectedExceptionGroup)"><i class="fa fa-repeat"></i> Retry all</button>
              <button type="button" class="btn btn-default" ng-show="vm.selectedExceptionGroup.id" confirm-title="Are you sure you want to delete this group?" confirm-message="If you delete, the messages in the group won't be available for retrying unless they're later restored." confirm-click="vm.archiveExceptionGroup(vm.selectedExceptionGroup)"><i class="fa fa-trash"></i> Delete all</button>
            </div>
          </div>
          <div class="col-3">
            <div class="msg-group-menu dropdown msg-list-dropdown">
              <label class="control-label">Sort by:</label>
              <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Message Type (ascending)
                <span class="caret"></span>
              </button>
              <ul class="dropdown-menu">
                <li>
                  <a href="#" ng-click="$event.preventDefault();vm.selectGroup(vm.selectedExceptionGroup, 'message_type', 'asc')"><span class="glyphicon glyphicon-sort-by-alphabet" aria-hidden="true"></span> Message Type (ascending)</a>
                </li>
                <li>
                  <a href="#" ng-click="$event.preventDefault();vm.selectGroup(vm.selectedExceptionGroup, 'message_type', 'desc')"><span class="glyphicon glyphicon-sort-by-alphabet-alt" aria-hidden="true"></span> Message Type (descending)</a>
                </li>
                <li>
                  <a href="#" ng-click="$event.preventDefault();vm.selectGroup(vm.selectedExceptionGroup, 'time_of_failure', 'asc')"><span class="glyphicon glyphicon-sort-by-alphabet" aria-hidden="true"></span> Time Of Failure (ascending)</a>
                </li>
                <li>
                  <a href="#" ng-click="$event.preventDefault();vm.selectGroup(vm.selectedExceptionGroup, 'time_of_failure', 'desc')"><span class="glyphicon glyphicon-sort-by-alphabet-alt" aria-hidden="true"></span> Time Of Failure (descending)</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </template>
  </template>
</template>

<style>
.select-all {
  width: 127px;
}

.msg-list-dropdown {
  margin: 1px 0 0 0 !important;
  padding-right: 0;
}

.msg-group-menu {
  margin: 21px 0px 0 6px;
  float: right;
  padding-top: 12px;
}

.msg-group-menu > .control-label {
  float: none;
}

.btn.sp-btn-menu {
  padding-left: 16px;
  background: none;
  border: none;
  color: #00a3c4;
  padding-right: 0;
}

.sp-btn-menu:hover {
  background: none;
  border: none;
  color: #00a3c4;
  text-decoration: underline;
}
</style>
