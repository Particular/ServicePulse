<script setup>
import { ref, inject } from "vue";
import PlatformLicenseExpired from "../PlatformLicenseExpired.vue";
import PlatformTrialExpired from "../PlatformTrialExpired.vue";
import PlatformProtectionExpired from "../PlatformProtectionExpired.vue";
import { key_ServiceControlUrl, key_MonitoringUrl, key_IsPlatformExpired, key_IsPlatformTrialExpired, key_IsInvalidDueToUpgradeProtectionExpired } from "./../../composables/keys.js"

const configuredServiceControlUrl = inject(key_ServiceControlUrl)
const configuredMonitoringUrl = inject(key_MonitoringUrl)

const isPlatformExpired = inject(key_IsPlatformExpired)
const isPlatformTrialExpired = inject(key_IsPlatformTrialExpired)
const isInvalidDueToUpgradeProtectionExpired = inject(key_IsInvalidDueToUpgradeProtectionExpired)

const testingServiceControl = ref(false)
const serviceControlValid = ref(false)

const testingMonitoring = ref(false)
const monitoringValid = ref(false)

const connectionSaved = ref(null)

const serviceControlUrl = ref(configuredServiceControlUrl.value)
const monitoringUrl = ref(configuredMonitoringUrl.value)

function testServiceControlUrl(event) {
    alert(`testServiceControlUrl!`)   
    if (event) {
        testingServiceControl.value = true
        return fetch(serviceControlUrl)
        .then(() => {
            serviceControlValid.value = true
        })        
        .catch(err => {
            serviceControlValid.value = false
        })
        .finally( () => {
            testingServiceControl.value = false
        })
    }
}

function testMonitoringUrl(event) {
    alert(`testMonitoringUrl!`)   
    if (event) {
        testingMonitoring.value = true
        return fetch(monitoringUrl.value + 'monitored-endpoints')
        .then(() => {
            monitoringValid.value = true
        })        
        .catch(err => {
            monitoringValid.value = false
        })
        .finally( () => {
            testingMonitoring.value = false
        })
    }
}

function saveConnections(event) {
    alert(`saveConnections!`)  
    if (event) {
        alert(event.target.tagName)  
    }  
}

</script>

<template>   
    <PlatformLicenseExpired :isPlatformExpired="isPlatformExpired" />
    <PlatformTrialExpired :isPlatformTrialExpired="isPlatformTrialExpired" />
    <PlatformProtectionExpired :isInvalidDueToUpgradeProtectionExpired="isInvalidDueToUpgradeProtectionExpired" />

    <template v-if="!isPlatformTrialExpired && !isPlatformExpired && !isInvalidDueToUpgradeProtectionExpired">
        <div class="container">
            <section name="connections">

                <div class="col-sm-12">
                    <div class="box">
                        <div class="row">
                            <div class="col-sm-12">

                                <form novalidate>
                                    <div class="row connection">
                                        <h3>ServiceControl</h3>

                                        <div class="col-sm-7 form-group">
                                            <label for="serviceControlUrl">CONNECTION URL<span v-show="unableToConnectToServiceControl" class="failed-validation"> <i class="fa fa-exclamation-triangle"></i> Unable to connect</span></label>
                                            <input type="text" id="serviceControlUrl" name="serviceControlUrl" v-model="serviceControlUrl" class="form-control" style="color: #000;" required />
                                        </div>

                                        <div class="col-sm-5 no-side-padding">
                                            <button class="btn btn-default btn-secondary btn-connection-test" :class="{ disabled: !configuredServiceControlUrl }" type="button" @click="testServiceControlUrl">Test</button>
                                            <span class="connection-test connection-testing" v-show="testingServiceControl"><i class="glyphicon glyphicon-refresh rotate"></i> Testing</span>
                                            <span class="connection-test connection-successful" v-show="serviceControlValid == true && !testingServiceControl"><i class="fa fa-check"></i> Connection successful</span>
                                            <span class="connection-test connection-failed" v-show="serviceControlValid == false && !testingServiceControl"><i class="fa fa-exclamation-triangle"></i> Connection failed</span>
                                        </div>

                                    </div>

                                    <div class="row connection">
                                        <h3>ServiceControl Monitoring</h3>
                                        <div class="col-sm-7 form-group">
                                            <label for="monitoringUrl">CONNECTION URL <span class="auxilliary-label">(OPTIONAL)</span><span v-show="unableToConnectToMonitoring" class="failed-validation"> <i class="fa fa-exclamation-triangle"></i> Unable to connect</span></label>
                                            <input type="text" id="monitoringUrl" name="monitoringUrl" v-model="monitoringUrl" class="form-control" required />
                                        </div>

                                        <div class="col-sm-5 no-side-padding">
                                            <button class="btn btn-default btn-secondary btn-connection-test" :class="{ disabled: !configuredMonitoringUrl }" type="button" @click="testMonitoringUrl">Test</button>
                                            <span class="connection-test connection-testing" v-show="testingMonitoring"><i class="glyphicon glyphicon-refresh rotate"></i> Testing</span>
                                            <span class="connection-test connection-successful" v-show="monitoringValid == true && !testingMonitoring"><i class="fa fa-check"></i> Connection successful</span>
                                            <span class="connection-test connection-failed" v-show="monitoringValid == false && !testingMonitoring"><i class="fa fa-exclamation-triangle"></i> Connection failed</span>
                                        </div>

                                    </div>

                                    <button class="btn btn-primary" type="button" @click="saveConnections">Save</button>
                                    <span class="connection-test connection-successful hide" v-show="connectionSaved"><i class="fa fa-check"></i>Connection saved</span>
                                    <span class="connection-test connection-failed hide" v-show="!connectionSaved"><i class="fa fa-exclamation-triangle"></i> Unable to save</span>
                               </form>

                            </div>
                        </div>
                    </div>
                </div>

            </section>
        </div>
    </template>
</template>