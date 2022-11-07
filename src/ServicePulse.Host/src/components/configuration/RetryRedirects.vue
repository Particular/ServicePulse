<script setup>
import { inject } from "vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import { key_IsSCConnected, key_ScConnectedAtLeastOnce, key_IsSCConnecting } from "./../../composables/keys.js"

const isSCConnected = inject(key_IsSCConnected)
const scConnectedAtLeastOnce = inject(key_ScConnectedAtLeastOnce)
const isSCConnecting = inject(key_IsSCConnecting)

</script>

<template>
    <h2>RetryRedirects</h2>
        
    <div class="sp-loader" v-if="isSCConnecting"></div>
    <ServiceControlNotAvailable :isSCConnected="isSCConnected" :isSCConnecting="isSCConnecting" :scConnectedAtLeastOnce="scConnectedAtLeastOnce" />

    <template v-if="isSCConnected || scConnectedAtLeastOnce">
        <section>
            <span>connected!</span>
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
</template>


<style>
</style>