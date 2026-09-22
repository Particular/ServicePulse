<script setup lang="ts">
import ConditionalRender from "@/components/ConditionalRender.vue";
import useIsThroughputSupported, { minimumSCVersionForThroughput } from "./isThroughputSupported";
import ExternalLink from "@/components/ExternalLink.vue";

const isThroughputSupported = useIsThroughputSupported();
</script>

<template>
  <ConditionalRender :supported="isThroughputSupported">
    <template #unsupported>
      <div class="container not-supported">
        <div class="row">
          <div class="col-sm-12">
            <div class="text-center message">
              <p>
                The minimum version of ServiceControl required to enable the Usage feature is
                <span> {{ minimumSCVersionForThroughput }} </span>.
              </p>
              <div>
                <ExternalLink class="btn btn-default btn-primary" href="https://particular.net/downloads">Update ServiceControl to latest version</ExternalLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <slot />
  </ConditionalRender>
</template>

<style scoped>
@import "@/components/notsupported.css";
</style>
