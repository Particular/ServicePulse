<script setup>
import { inject, ref, reactive, onMounted } from "vue";
import PlatformLicenseExpired from "../PlatformLicenseExpired.vue";
import PlatformTrialExpired from "../PlatformTrialExpired.vue";
import PlatformProtectionExpired from "../PlatformProtectionExpired.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import NoData from "../NoData.vue"
import Busy from "../Busy.vue"
import { key_ServiceControlUrl, key_IsSCConnected, key_ScConnectedAtLeastOnce, key_IsSCConnecting, key_IsPlatformExpired, key_IsPlatformTrialExpired, key_IsInvalidDueToUpgradeProtectionExpired } from "./../../composables/keys.js"
import {useRedirects, useUpdateRedirects, useCreateRedirects, useDeleteRedirects} from "../../composables/serviceRedirects.js"

const isPlatformExpired = inject(key_IsPlatformExpired)
const isPlatformTrialExpired = inject(key_IsPlatformTrialExpired)
const isInvalidDueToUpgradeProtectionExpired = inject(key_IsInvalidDueToUpgradeProtectionExpired)

const isSCConnected = inject(key_IsSCConnected)
const scConnectedAtLeastOnce = inject(key_ScConnectedAtLeastOnce)
const isSCConnecting = inject(key_IsSCConnecting)

const configuredServiceControlUrl = inject(key_ServiceControlUrl)

const loadingData = ref(true)
const redirects = reactive({
    total: 0,
    data: []
})

function getRedirect() {
    loadingData.value = true
    useRedirects(configuredServiceControlUrl.value).then(result => {
        redirects.total = result.total
        redirects.data = result.data        

        loadingData.value = false
    }) 
}

function createRedirect() {
    alert('create')
}

function editRedirect(redirect) {
    alert('edit')
}

function deleteRedirect(redirect, successMsg, errorMsg) {
    alert('delete')
}

onMounted(() => {
    getRedirect()
})

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
                
                    <Busy v-if="loadingData"></Busy>

                    <div class="row">
                        <div class="col-sm-12">
                            <div class="btn-toolbar">
                                <button type="button" class="btn btn-default" @click="createRedirect"><i class="fa pa-redirect-source pa-redirect-small"></i> Create Redirect</button>
                                <span></span>
                            </div>
                        </div>
                    </div>

                    <NoData v-if="redirects.total === 0 && !loadingData" title="Redirects" message="There are currently no redirects"></NoData>

                    <div class="row">
                        <template v-if="redirects.total > 0">
                            <div class="col-sm-12">
                                <template v-for="redirect in redirects.data.sort(from_physical_address)" :key="redirect.redirectId">
                                    <div class="row box repeat-modify">
                                        <div class="row" id="{{redirect.from_physical_address}}">
                                            <div class="col-sm-12">
                                                <p class="lead hard-wrap truncate" uib-tooltip="{{redirect.from_physical_address}}">
                                                    <i class="fa pa-redirect-source pa-redirect-small" uib-tooltip="Source queue name"></i>
                                                    {{redirect.from_physical_address}}
                                                </p>
                                                <p class="lead hard-wrap truncate" uib-tooltip="{{redirect.to_physical_address}}">
                                                    <i class="fa pa-redirect-destination pa-redirect-small" uib-tooltip="Destination queue name"></i>
                                                    {{redirect.to_physical_address}}
                                                </p>
                                                <p class="metadata">
                                                    <i class="fa fa-clock-o"></i>
                                                    Last modified: {{redirect.last_modified}}
                                                    <!-- Last modified: <sp-moment date="{{redirect.last_modified}}"></sp-moment> -->
                                                </p>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div isolate-click class="col-sm-12">
                                                <p class="small">
                                                    <button type="button" class="btn btn-link btn-sm" confirm-title="Are you sure you want to end the redirect?" @confirm-click="deleteRedirect(redirect, 'Redirect was deleted', 'Failed to delete redirect')"
                                                            confirm-message="Once the redirect is ended, any affected messages will be sent to the original destination queue. Ensure this queue is ready to accept messages again.">
                                                        End Redirect
                                                    </button>
                                                    <button type="button" class="btn btn-link btn-sm" @click="editRedirect(redirect)">
                                                        Modify Redirect
                                                    </button>
                                                </p>
                                            </div>

                                        </div>
                                    </div>
                                </template>
                            </div>
                        </template>
                    </div>
                </section>
            </template>   
        </section>
    </template> 
</template>


<style>
</style>