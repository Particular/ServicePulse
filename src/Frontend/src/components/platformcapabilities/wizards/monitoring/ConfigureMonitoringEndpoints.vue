<template>
  <div>
    <p>Add the metrics plugin to your endpoint configuration:</p>
    <pre><code>var metrics = endpointConfiguration.EnableMetrics();
metrics.SendMetricDataToServiceControl(
    serviceControlMetricsAddress: SERVICE_CONTROL_METRICS_ADDRESS,
    interval: TimeSpan.FromMinutes(1),
    instanceId: "INSTANCE_ID_OPTIONAL");</code></pre>
    <p>Make sure the queue name matches your ServiceControl Monitoring instance queue.</p>
  </div>
</template>
