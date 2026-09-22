<script setup lang="ts">
import ExternalLink from "@/components/ExternalLink.vue";
</script>

<template>
  <div>
    <p>To enable auditing in ServicePulse, you need to setup a ServiceControl Audit instance. There are multiple ways to do this:</p>
    <ul>
      <li>
        <strong><ExternalLink href="https://docs.particular.net/servicecontrol/audit-instances/deployment/powershell">Scripted Deployment</ExternalLink></strong> - Use a script to automate the installation and configuration of the audit instance
      </li>
      <li>
        <strong><ExternalLink href="https://docs.particular.net/servicecontrol/audit-instances/deployment/containers">Containers</ExternalLink></strong> - Run the audit instance inside a container
      </li>
      <li>
        <strong><ExternalLink href="https://docs.particular.net/servicecontrol/audit-instances/deployment/scmu">ServiceControl Management Utility</ExternalLink></strong> - Use the management utility to create and configure the audit instance
      </li>
    </ul>
    <p>The audit instance stores processed messages and makes them available for viewing in ServicePulse.</p>
  </div>
</template>
