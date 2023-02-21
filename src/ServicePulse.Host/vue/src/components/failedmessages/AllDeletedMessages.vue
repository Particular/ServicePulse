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
        <div class="box">
          <div class="row">
            <div class="col-sm-12">
              <div class="list-section">
                <h3>All deleted messages</h3>
                <div class="col-sm-7 form-group">
                  <label for="serviceControlUrl"> deleted messages details </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </template>
</template>
