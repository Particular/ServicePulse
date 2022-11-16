<script setup>
const props=defineProps({
  isInvalidDueToUpgradeProtectionExpired: Boolean  
})

</script>

<template>
  <template v-if="props.isInvalidDueToUpgradeProtectionExpired">
    <div class="text-center monitoring-no-data" style="max-width: 620px;">
      <h1>Platform license expired</h1>
      <p>Your upgrade protection period has elapsed and your license is not valid for this version of ServicePulse.</p>
      <div class="action-toolbar">
          <a class="btn btn-default btn-primary" href="/configuration#license">View license details</a>
      </div>
    </div>
  </template>
</template>
