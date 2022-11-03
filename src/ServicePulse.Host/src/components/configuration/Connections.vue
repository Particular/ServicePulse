<script setup>
import { ref, inject } from "vue";
import PlatformLicenseExpired from "./../PlatformLicenseExpired.vue";
import PlatformTrialExpired from "./../PlatformTrialExpired.vue";
import PlatformProtectionExpired from "./../PlatformProtectionExpired.vue";

const configuredServiceControlUrl = inject("serviceControlUrl")

const isPlatformExpired = inject("isPlatformExpired")
const isPlatformTrialExpired = inject("isPlatformTrialExpired")
const isInvalidDueToUpgradeProtectionExpired = inject("isInvalidDueToUpgradeProtectionExpired")

const testingServiceControl = ref(false)
const serviceControlValid = ref(false)

//const connectionSaved = ref(null)

function testServiceControlUrl(event) {
    alert(`testServiceControlUrl!`)   
    if (event) {
        testingServiceControl.value = true
        alert(event.target.tagName)  
    }
}

/* function saveConnections(event) {
    alert(`saveConnections!`)  
    if (event) {
        alert(event.target.tagName)  
    }  
} */

</script>

<template> 
<h2>Connections</h2>   
   <!--  <PlatformLicenseExpired :is-platform-trial-expired="isPlatformTrialExpired" />
    <PlatformTrialExpired :is-platform-expired="isPlatformExpired" />
    <PlatformProtectionExpired :is-invalid-due-to-upgrade-protection-expired="isInvalidDueToUpgradeProtectionExpired" /> 
    
    <template v-if="!isPlatformTrialExpired && !isPlatformExpired && !isInvalidDueToUpgradeProtectionExpired">
        <div class="container">
            <div class="row">
                <div class="col-sm-12">
                    <h1>Configuration</h1>
                </div>
            </div>
        </div>
    </template>
-->
    <!-- <template v-if="!isPlatformTrialExpired && !isPlatformExpired && !isInvalidDueToUpgradeProtectionExpired">
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
                                            <input type="text" id="serviceControlUrl" name="serviceControlUrl" v-model="configuredServiceControlUrl" class="form-control" style="color: #000;" required />
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
                                            <label for="monitoringUrl">CONNECTION URL <span class="auxilliary-label">(OPTIONAL)</span><span
                                                ng-show="vm.unableToConnectToMonitoring" class="failed-validation"> <i class="fa fa-exclamation-triangle"></i> Unable to connect</span>
                                                </label>
                                            <input type="text" id="monitoringUrl" name="monitoringUrl"
                                                ng-model="vm.configuredMonitoringUrl" class="form-control" required />
                                        </div>

                                        <div class="col-sm-5 no-side-padding">
                                            <button class="btn btn-default btn-secondary btn-connection-test" ng-class="{ disabled: !vm.configuredMonitoringUrl }" type="button"
                                                ng-click="vm.testMonitoringUrl()">Test</button>
                                            <span class="connection-test connection-testing" ng-show="vm.testingMonitoring"><i
                                                    class="glyphicon glyphicon-refresh rotate"></i> Testing</span>
                                            <span class="connection-test connection-successful"
                                                ng-show="vm.monitoringValid == true && !vm.testingMonitoring"><i
                                                    class="fa fa-check"></i> Connection successful</span>
                                            <span class="connection-test connection-failed"
                                                ng-show="vm.monitoringValid == false && !vm.testingMonitoring"><i
                                                    class="fa fa-exclamation-triangle"></i> Connection failed</span>
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
    </template> -->
</template>

<style>
</style>