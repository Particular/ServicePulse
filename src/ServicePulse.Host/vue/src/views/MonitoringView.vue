<script setup>
    import { ref, onMounted } from "vue";
    import LicenseExpired from "../components/LicenseExpired.vue";
    import { licenseStatus } from "../composables/serviceLicense.js";
    import ServiceControlNotAvailable from "../components/ServiceControlNotAvailable.vue";
    import { connectionState } from "../composables/serviceServiceControl";
    import { useRedirects } from "../composables/serviceRedirects.js";
    import EndpointList from "../components/monitoring/EndpointList.vue";

    const redirectCount = ref(0);

    onMounted(() => {
        useRedirects().then((result) => {
            redirectCount.value = result.total;
        });
    });

</script>


<template>

    <LicenseExpired />
    <template v-if="!licenseStatus.isExpired">
        <div class="container">
            <ServiceControlNotAvailable />
            <template v-if="connectionState.connected">

                <div class="row">
                    <div class="col-6 list-section">
                        <h1>Endpoints Overview</h1>
                    </div>
                    <!--filters-->
                    <div class="col-6 toolbar-menus no-side-padding">
                        <div class="msg-group-menu dropdown">
                            <label class="control-label">Group by:</label>
                            <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                selectedClassifier
                                <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu">
                                <li>
                                    <a> classifier1</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!--List of endpoints-->
                <EndpointList></EndpointList>

            </template>
        </div>
    </template>
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

