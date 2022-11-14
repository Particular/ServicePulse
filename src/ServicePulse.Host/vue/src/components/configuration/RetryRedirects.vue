<script setup>
import { inject } from "vue";
import PlatformLicenseExpired from "../PlatformLicenseExpired.vue";
import PlatformTrialExpired from "../PlatformTrialExpired.vue";
import PlatformProtectionExpired from "../PlatformProtectionExpired.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import { key_IsSCConnected, key_ScConnectedAtLeastOnce, key_IsSCConnecting, key_IsPlatformExpired, key_IsPlatformTrialExpired, key_IsInvalidDueToUpgradeProtectionExpired } from "./../../composables/keys.js"

const isPlatformExpired = inject(key_IsPlatformExpired)
const isPlatformTrialExpired = inject(key_IsPlatformTrialExpired)
const isInvalidDueToUpgradeProtectionExpired = inject(key_IsInvalidDueToUpgradeProtectionExpired)

const isSCConnected = inject(key_IsSCConnected)
const scConnectedAtLeastOnce = inject(key_ScConnectedAtLeastOnce)
const isSCConnecting = inject(key_IsSCConnecting)

</script>

<template>
    <PlatformLicenseExpired :isPlatformExpired="isPlatformExpired" />
    <PlatformTrialExpired :isPlatformTrialExpired="isPlatformTrialExpired" />
    <PlatformProtectionExpired :isInvalidDueToUpgradeProtectionExpired="isInvalidDueToUpgradeProtectionExpired" />

    <template v-if="!isPlatformTrialExpired && !isPlatformExpired && !isInvalidDueToUpgradeProtectionExpired">
        <section name="redirects">
            <div class="sp-loader" v-if="isSCConnecting"></div>
            <ServiceControlNotAvailable :isSCConnected="isSCConnected" :isSCConnecting="isSCConnecting" :scConnectedAtLeastOnce="scConnectedAtLeastOnce" />

            <template v-if="isSCConnected || scConnectedAtLeastOnce">
                <section>
                    <div class="box">
                        <div class="row">
                            <h2>RetryRedirects</h2>
                        </div>
                    </div>
                    <!-- <busy v-show="vm.loadingData" message="fetching more redirects"></busy>

                    <div class="row">
                        <div class="col-sm-12">
                            <div class="btn-toolbar">
                                <button type="button" class="btn btn-default" @click="vm.createRedirect()"><i class="fa pa-redirect-source pa-redirect-small"></i> Create Redirect</button>
                                <span></span>
                            </div>
                        </div>
                    </div>

                    <no-data v-show="vm.redirects.length === 0 && !vm.loadingData" title="redirects" message="There are currently no redirects"></no-data>  -->
                    </section>
            </template>   
        </section>
    </template> 
</template>


<style>
</style>