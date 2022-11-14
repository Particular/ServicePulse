<script setup>
import { inject, ref } from "vue";
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

const emailTestSuccessful=ref(null)
const emailTestInProgress=ref(null)
const emailTestFailure=ref(null)
const notificationEnabled=ref(null)

function toggleEmailNotifications() {
    alert('toggleEmailNotifications')
}

function editEmailNotifications() {
    alert('editEmailNotifications')
}

function testEmailNotifications() {
    alert('testEmailNotifications')
}
</script>

<template>
    <PlatformLicenseExpired :isPlatformExpired="isPlatformExpired" />
    <PlatformTrialExpired :isPlatformTrialExpired="isPlatformTrialExpired" />
    <PlatformProtectionExpired :isInvalidDueToUpgradeProtectionExpired="isInvalidDueToUpgradeProtectionExpired" />

    <template v-if="!isPlatformTrialExpired && !isPlatformExpired && !isInvalidDueToUpgradeProtectionExpired">        
        <section name="notifications">
            <div class="sp-loader" v-if="isSCConnecting"></div>
            <ServiceControlNotAvailable :isSCConnected="isSCConnected" :isSCConnecting="isSCConnecting" :scConnectedAtLeastOnce="scConnectedAtLeastOnce" />

            <template v-if="isSCConnected || scConnectedAtLeastOnce"> 
                <section>
                    <div class="row">
                        <div class="col-sm-12">
                            <p class="screen-intro">
                                Configure notifications for health checks built into ServiceControl (low disk space, stale
                                database indexes, and messages in error queue).
                            </p>
                        </div>
                    </div>
                    <div class="notifications row">
                        <div class="col-sm-12">
                            <div class="row box box-no-click">
                                <div class="col-sm-12 no-side-padding">
                                    <div class="row">
                                        <div class="col-xs-1">
                                            <div class="onoffswitch">
                                                <input type="checkbox" id="onoffswitch" name="onoffswitch"
                                                    class="onoffswitch-checkbox" @click="toggleEmailNotifications"
                                                    v-model="notificationEnabled">
                                                <label class="onoffswitch-label" for="onoffswitch">
                                                    <span class="onoffswitch-inner"></span>
                                                    <span class="onoffswitch-switch"></span>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-xs-9 col-sm-10 col-lg-11">
                                            <div class="row box-header">
                                                <div class="col-xs-12">
                                                    <p class="lead">
                                                        Email notifications
                                                    </p>
                                                    <p class="endpoint-metadata">
                                                        <button class="btn btn-link btn-sm" type="button"
                                                            @click="editEmailNotifications"><i
                                                                class="fa fa-edit"></i>Configure</button>
                                                    </p>
                                                    <p class="endpoint-metadata">
                                                        <button class="btn btn-link btn-sm" type="button"
                                                            @click="testEmailNotifications"
                                                            :disabled="emailTestInProgress"><i
                                                                class="fa fa-envelope"></i>Send test notification</button>
                                                        <span class="connection-test connection-testing">
                                                            <template v-if="emailTestInProgress">
                                                                <i class="glyphicon glyphicon-refresh rotate"></i> Testing
                                                            </template>
                                                        </span>
                                                        <span class="connection-test connection-successful">
                                                            <template v-if="emailTestSuccessful">                                                            
                                                                <i class="fa fa-check"></i> Test email sent successfully
                                                            </template>
                                                        </span>
                                                        <span class="connection-test connection-failed">
                                                            <template v-if="emailTestFailure">                                                                                                                        
                                                                <i class="fa fa-exclamation-triangle"></i> Test failed
                                                            </template>                                                            
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section> 
            </template>
        </section>
    </template>
</template>

<style>
</style>