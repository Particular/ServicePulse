<script setup lang="ts">
import ExternalLink from "@/components/ExternalLink.vue";
</script>

<template>
  <div>
    <p>To enable monitoring in ServicePulse, you need to set up a ServiceControl Monitoring instance. There are multiple ways to do this:</p>
    <ul>
      <li>
        <strong><ExternalLink href="https://docs.particular.net/servicecontrol/monitoring-instances/deployment/powershell">Scripted Deployment</ExternalLink></strong> - Use a script to automate the installation and configuration of the monitoring
        instance
      </li>
      <li>
        <strong><ExternalLink href="https://docs.particular.net/servicecontrol/monitoring-instances/deployment/containers">Containers</ExternalLink></strong> - Run the monitoring instance inside a container
      </li>
      <li>
        <strong><ExternalLink href="https://docs.particular.net/servicecontrol/monitoring-instances/deployment/scmu">ServiceControl Management Utility</ExternalLink></strong> - Use the management utility to create and configure the monitoring
        instance
      </li>
    </ul>
    <p>The monitoring instance collects and aggregates metrics from your endpoints.</p>
  </div>
</template>
