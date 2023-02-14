<script setup>
import { licenseStatus } from "../../composables/serviceLicense.js";
import { connectionState } from "../../composables/serviceServiceControl.js";
import LicenseExpired from "../../components/LicenseExpired.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import LastTenOperations from "../failedmessages/LastTenOperations.vue";
import MessageGroupList from "../failedmessages/MessageGroupList.vue";
import GroupAndOrderBy from "./GroupAndOrderBy.vue";
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <ServiceControlNotAvailable />
    <template v-if="!connectionState.unableToConnect">
      <section name="message_groups">
        <LastTenOperations></LastTenOperations>
        <div class="row">
          <div class="col-xs-6 list-section">
            <h3>Failed message group</h3>
          </div>
          <div class="col-xs-6 toolbar-menus no-side-padding">
            <GroupAndOrderBy></GroupAndOrderBy>
          </div>
        </div>
        <div class="box">
          <div class="row">
            <div class="col-sm-12">
              <div class="list-section">
                <div class="col-sm-12 form-group">
                  <MessageGroupList></MessageGroupList>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </template>
</template>
