<template>
  <div>
    <p>Your ServiceControl Audit instance is connected, but no endpoints are sending audit messages yet.</p>
    <p>To see messages in ServicePulse, you need to enable auditing in your NServiceBus endpoints:</p>
    <ul>
      <li><strong>Configure the audit queue</strong> - Tell your endpoints where to send audit copies</li>
      <li><strong>Deploy your changes</strong> - Restart endpoints with the new configuration</li>
      <li><strong>Process some messages</strong> - Send test messages to verify auditing works</li>
    </ul>
  </div>
</template>
