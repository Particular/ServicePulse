<script setup>
    import { ref, onMounted } from "vue";
    //import { licenseStatus } from "../composables/serviceLicense.js";
    //import { connectionState, monitoringConnectionState } from "../composables/serviceServiceControl";
    //import { useIsMonitoringEnabled } from "../composables/serviceServiceControlUrls";
    import { useRedirects } from "../composables/serviceRedirects.js";

    const redirectCount = ref(0);

    //function updateRedirectCount(newCount) {
    //    redirectCount.value = newCount;
    //}

    //function subIsActive(subPath) {
    //    return window.location.hash.endsWith(subPath);
    //}

    onMounted(() => {
        useRedirects().then((result) => {
            redirectCount.value = result.total;
        });
    });
</script>

<template>
    <div class="container">
        <div class="row">
            <div class="col-sm-12">
                <h1>Endpoints overview</h1>
            </div>
        </div>

    </div>
</template>

<style>
    .tabs-config-snippets .tabs {
        margin: 30px 0 15px;
    }

    .tabs-config-snippets highlight {
        margin-bottom: 20px;
        display: block;
    }

    .tabs-config-snippets p {
        font-size: 16px;
        color: #181919;
    }

    .tabs-config-snippets .alert {
        margin-bottom: 15px;
    }

        .tabs-config-snippets .alert li {
            margin-bottom: 0;
        }

    div.btn-toolbar,
    div.form-inline {
        margin-bottom: 12px;
    }

    .btn-toolbar button:last-child {
        margin-top: 0 !important;
    }

    .pa-redirect-source {
        background-image: url("@/assets/redirect-source.svg");
        background-position: center;
        background-repeat: no-repeat;
    }

    .pa-redirect-small {
        position: relative;
        top: 1px;
        height: 14px;
        width: 14px;
    }

    .pa-redirect-large {
        height: 24px;
    }

    .pa-redirect-destination {
        background-image: url("@/assets/redirect-destination.svg");
        background-position: center;
        background-repeat: no-repeat;
    }

    section[name="connections"] .box {
        padding-bottom: 50px;
    }
</style>
