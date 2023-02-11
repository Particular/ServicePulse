<script setup>
import { licenseStatus } from "../../composables/serviceLicense.js";
import LicenseExpired from "../../components/LicenseExpired.vue";
import { connectionState } from "../../composables/serviceServiceControl.js";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import LastTenOperations from "../failedmessages/LastTenOperations.vue";
import MessageGroupList from "../failedmessages/MessageGroupList.vue";
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <ServiceControlNotAvailable />
    <template v-if="!connectionState.unableToConnect">
      <section name="message_groups">
        <LastTenOperations></LastTenOperations>
        <h3>Failed message group</h3>
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
