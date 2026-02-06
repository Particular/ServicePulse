<template>
  <div>
    <p>Your ServiceControl Monitoring instance is connected, but no endpoints are sending metrics yet.</p>
    <p>To see metrics in ServicePulse, install the monitoring plugin in your NServiceBus endpoints:</p>
    <ul>
      <li><strong>Add the NuGet package</strong> - Install <code>NServiceBus.Metrics.ServiceControl</code></li>
      <li><strong>Configure the plugin</strong> - Point it to your monitoring instance</li>
      <li><strong>Deploy your changes</strong> - Restart endpoints with the new configuration</li>
    </ul>
  </div>
</template>
