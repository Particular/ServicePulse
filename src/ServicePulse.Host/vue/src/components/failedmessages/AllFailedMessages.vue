<script setup>
    import { ref } from "vue";
    import LicenseExpired from "../LicenseExpired.vue";
    import { licenseStatus } from "../../composables/serviceLicense.js";
    import {
        updateServiceControlUrls,
        serviceControlUrl as configuredServiceControlUrl,
        monitoringUrl as configuredMonitoringUrl,
    } from "./../../composables/serviceServiceControlUrls.js";
    import {
        connectionState,
        monitoringConnectionState,
    } from "../../composables/serviceServiceControl";

    const isExpired = licenseStatus.isExpired;
</script>

<template v-if="!isExpired">
    <section name="failed_messages">
        <div class="box">
            <div class="row">
                <div class="col-sm-12">
                    <div class="list-section">
                        <h3>All Failed Messages</h3>
                        <div class="col-sm-7 form-group">
                            <label for="messagelist"> messages list </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>


<style scoped></style>
