<script setup>
import { isSCConnected, scConnectedAtLeastOnce } from "./../../composables/serviceControl.js";
</script>

<template>
    <h2>RetryRedirects</h2>

    <div class="sp-loader" ng-if="isSCConnecting"></div>
    <div ng-include="'js/views/sc_not_available.html'" ng-show="!isSCConnected && !isSCConnecting && !scConnectedAtLeastOnce"></div>

    <section v-if="isSCConnected || scConnectedAtLeastOnce">

        <busy ng-show="vm.loadingData" message="fetching more redirects"></busy>

        <div class="row">
            <div class="col-sm-12">
                <div class="btn-toolbar">
                    <button type="button" class="btn btn-default" ng-click="vm.createRedirect()"><i class="fa pa-redirect-source pa-redirect-small"></i> Create Redirect</button>
                    <span></span>
                </div>
            </div>
        </div>

        <no-data ng-show="vm.redirects.length === 0 && !vm.loadingData" title="redirects" message="There are currently no redirects"></no-data>
    </section>
</template>


<style>
</style>