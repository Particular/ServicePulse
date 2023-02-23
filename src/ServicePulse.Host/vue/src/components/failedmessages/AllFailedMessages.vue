<script setup>
import { ref } from "vue";
import { licenseStatus } from "../../composables/serviceLicense.js";
import { connectionState } from "../../composables/serviceServiceControl.js";
import LicenseExpired from "../../components/LicenseExpired.vue";
import GroupAndOrderBy from "./GroupAndOrderBy.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";

const sortMethod = ref({});

function sortGroups(sort) {
  sortMethod.value = sort.sort;
}
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
            <GroupAndOrderBy @sort-updated="sortGroups" :hideGroupBy="true"></GroupAndOrderBy>
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
