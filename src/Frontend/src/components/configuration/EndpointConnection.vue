<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useEndpointConnectionStore } from "@/stores/EndpointConnectionStore";
import LicenseNotExpired from "../LicenseNotExpired.vue";
import ServiceControlAvailable from "../ServiceControlAvailable.vue";
import CodeEditor from "@/components/CodeEditor.vue";
import LoadingSpinner from "../LoadingSpinner.vue";

const store = useEndpointConnectionStore();
const showCodeOnlyTab = ref(true);

const jsonSnippet = computed(() => {
  return `var json = File.ReadAllText("<path-to-json-file>.json");
var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(json);
endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);
`;
});

const inlineSnippet = computed(() => {
  const snippetTemplate = `var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(@"<json>");

    endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);
    `;

  if (!store.config) {
    return "";
  }

  const jsonText = JSON.stringify(store.config, null, 4).replaceAll('"', '""');
  return snippetTemplate.replace("<json>", jsonText);
});

const jsonConfig = computed(() => {
  if (!store.config) {
    return "";
  }
  return JSON.stringify(store.config, null, 4);
});

onMounted(async () => {
  await store.fetchEndpointConnectionData();
});

function switchCodeOnlyTab() {
  showCodeOnlyTab.value = true;
}

function switchJsonTab() {
  showCodeOnlyTab.value = false;
}
</script>

<template>
  <section name="platformconnection">
    <ServiceControlAvailable>
      <LicenseNotExpired>
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
              <LoadingSpinner v-show="store.loading"></LoadingSpinner>

              <!-- Nav tabs -->
              <div v-if="!store.loading" class="tabs" role="tablist">
                <h5 :class="{ active: showCodeOnlyTab }">
                  <a @click="switchCodeOnlyTab()" class="ng-binding" role="tab" aria-label="endpoint-configuration-only-tab" :aria-selected="showCodeOnlyTab">Endpoint configuration only</a>
                </h5>
                <h5 :class="{ active: !showCodeOnlyTab }">
                  <a @click="switchJsonTab()" class="ng-binding" role="tab" aria-label="json-file-tab" :aria-selected="!showCodeOnlyTab">JSON file</a>
                </h5>
              </div>

              <div v-if="store.queryErrors.length > 0 && !store.loading" class="alert alert-warning" role="alert">
                There were problems reaching some ServiceControl instances and the configuration does not contain all connectivity information.
                <ul>
                  <li v-for="error in store.queryErrors" :key="error">
                    {{ error }}
                  </li>
                </ul>
              </div>

              <section v-if="showCodeOnlyTab && !store.loading" role="tabpanel" aria-label="Endpoint configuration only">
                <div class="row">
                  <div class="col-12 h-100">
                    <CodeEditor ariaLabel="endpoint-configuration-code-editor" :model-value="inlineSnippet" language="csharp" :show-gutter="false" :show-copy-to-clipboard="true"></CodeEditor>
                  </div>
                </div>
              </section>

              <section v-if="!showCodeOnlyTab && !store.loading" role="tabpanel" aria-label="JSON file">
                <div class="row">
                  <div class="col-12 h-100">
                    <p>Note that when using JSON for configuration, you also need to change the endpoint configuration as shown below.</p>
                    <p><strong>Endpoint configuration:</strong></p>
                    <CodeEditor ariaLabel="json-file-csharp-code-editor" :model-value="jsonSnippet" language="csharp" :show-gutter="false" :show-copy-to-clipboard="true"></CodeEditor>
                    <p style="margin-top: 15px">
                      <strong>JSON configuration file:</strong>
                    </p>
                    <CodeEditor ariaLabel="json-file-json-code-editor" :model-value="jsonConfig" language="json" :show-gutter="false" :show-copy-to-clipboard="true"></CodeEditor>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </LicenseNotExpired>
    </ServiceControlAvailable>
  </section>
</template>

<style scoped>
.configuration :deep(pre) {
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

:deep(.code) {
  padding-bottom: 20px;
}

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
</style>
