<script setup>
import { inject } from "vue";
import { key_ServiceControlUrl } from "./../composables/keys.js"
const serviceControlUrl = inject(key_ServiceControlUrl)

const props = defineProps({
    isSCConnected: Boolean,
    isSCConnecting: Boolean,
    scConnectedAtLeastOnce: Boolean    
})
</script>

<template>
    <template v-if="!props.isSCConnected && !props.isSCConnecting && !props.scConnectedAtLeastOnce">
    <div class="text-center monitoring-no-data">
        <h1>Cannot connect to ServiceControl</h1>
        <p>
            ServicePulse is unable to connect to the ServiceControl instance at <span id="serviceControlUrl">{{serviceControlUrl}}</span>. Please ensure that ServiceControl is running and accessible from your machine.
        </p>
        <div class="action-toolbar">
            <a href="/configuration#connections" class="btn btn-default btn-primary whiteText">View Connection Details</a> <a class="btn btn-default btn-secondary" href="https://docs.particular.net/monitoring/metrics/">Learn more</a>
        </div>
    </div>
    </template>
</template>
