<script setup lang="ts">
import { onMounted, ref } from "vue";
import LicenseExpired from "../LicenseExpired.vue";
import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
import { licenseStatus } from "@/composables/serviceLicense";
import { connectionState, useServiceControlConnections } from "@/composables/serviceServiceControl";
import BusyIndicator from "../BusyIndicator.vue";
import { HighCode } from "vue-highlight-code";
import "vue-highlight-code/dist/style.css";

const isExpired = licenseStatus.isExpired;

const loading = ref(true);
const showCodeOnlyTab = ref(true);
const jsonSnippet = ref("");
const inlineSnippet = ref("");
const jsonConfig = ref("");
const queryErrors = ref<string[]>([]);

async function getCode() {
  loading.value = true;

  const snippetTemplate = `var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(@"<json>");

    endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);
    `;

  jsonSnippet.value = `var json = File.ReadAllText("<path-to-json-file>.json");
var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(json);
endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);
`;
  const connections = await useServiceControlConnections();
  const config = {
    heartbeats: connections.serviceControl.settings.Heartbeats,
    customChecks: connections.serviceControl.settings.CustomChecks,
    errorQueue: connections.serviceControl.settings.ErrorQueue,
    metrics: connections.monitoring.settings,
  };
  let jsonText = JSON.stringify(config, null, 4);
  jsonConfig.value = jsonText;

  jsonText = jsonText.replaceAll('"', '""');
  inlineSnippet.value = snippetTemplate.replace("<json>", jsonText);

  queryErrors.value = [];
  queryErrors.value = queryErrors.value.concat(connections.serviceControl.errors || []);
  queryErrors.value = queryErrors.value.concat(connections.monitoring.errors || []);

  loading.value = false;
}

onMounted(async () => {
  await getCode();
});

function switchCodeOnlyTab() {
  showCodeOnlyTab.value = true;
}

function switchJsonTab() {
  showCodeOnlyTab.value = false;
}
</script>

<template>
  <LicenseExpired />
  <template v-if="!isExpired">
    <section name="platformconnection">
      <ServiceControlNotAvailable />
      <template v-if="!connectionState.unableToConnect">
        <div class="box configuration">
          <div class="row">
            <div class="col-12">
              <h3>Connect an endpoint to ServiceControl</h3>
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <ol>
                <li>Add the <a href="https://www.nuget.org/packages/NServiceBus.ServicePlatform.Connector/">NServiceBus.ServicePlatform.Connector</a> NuGet package to the endpoint project.</li>
                <li>Copy-paste the code from one of the options below. For additional options, refer to the <a href="https://docs.particular.net/platform/connecting">documentation</a></li>
              </ol>
            </div>
          </div>
          <div class="row tabs-config-snippets">
            <div class="col-12">
              <busy-indicator v-show="loading"></busy-indicator>

              <!-- Nav tabs -->
              <div v-if="!loading" class="tabs" role="tablist">
                <h5 :class="{ active: showCodeOnlyTab }">
                  <a @click="switchCodeOnlyTab()" class="ng-binding">Endpoint configuration only</a>
                </h5>
                <h5 :class="{ active: !showCodeOnlyTab }">
                  <a @click="switchJsonTab()" class="ng-binding">JSON file</a>
                </h5>
              </div>

              <div v-if="queryErrors.length > 0 && !loading" class="alert alert-warning" role="alert">
                There were problems reaching some ServiceControl instances and the configuration does not contain all connectivity information.
                <ul>
                  <li v-for="error in queryErrors" :key="error">
                    {{ error }}
                  </li>
                </ul>
              </div>

              <section v-if="showCodeOnlyTab && !loading">
                <div class="row">
                  <div class="col-12 h-100">
                    <HighCode :codeValue="inlineSnippet" lang="csharp" :fontSize="'12px'" :width="'100%'" :height="'100%'" :borderRadius="'0px'" :nameShow="false" :copy="true"></HighCode>
                  </div>
                </div>
              </section>

              <section v-if="!showCodeOnlyTab && !loading">
                <div class="row">
                  <div class="col-12 h-100">
                    <p>Note that when using JSON for configuration, you also need to change the endpoint configuration as shown below.</p>
                    <p><strong>Endpoint configuration:</strong></p>
                    <HighCode :codeValue="jsonSnippet" lang="csharp" :fontSize="'12px'" :width="'100%'" :height="'100%'" :nameShow="false" :borderRadius="'0px'" :copy="true"></HighCode>
                    <p style="margin-top: 15px">
                      <strong>JSON configuration file:</strong>
                    </p>
                    <HighCode :codeValue="jsonConfig" lang="json" :fontSize="'12px'" :width="'100%'" :height="'100%'" :nameShow="false" :borderRadius="'0px'" :copy="true"></HighCode>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </template>
    </section>
  </template>
</template>

<style>
.configuration pre {
  border: none;
  background-color: #282c34;
}

.box > .row {
  margin-left: 0;
}

section[name="platformconnection"] ol {
  font-size: 16px;
  padding-left: 18px;
  margin: 15px 0 0;
}

section[name="platformconnection"] li {
  margin-bottom: 15px;
}

.code {
  padding-bottom: 20px;
}
</style>
