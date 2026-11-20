<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import routeLinks from "@/router/routeLinks";
import FAIcon from "@/components/FAIcon.vue";
import { faArrowTurnUp, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import usePlatformHealthStoreAutoRefresh from "@/composables/usePlatformHealthStoreAutoRefresh";
import { useEnvironmentAndVersionsStore } from "@/stores/EnvironmentAndVersionsStore";

defineProps<{
  collapsed?: boolean;
}>();

const { store: platformHealthStore } = usePlatformHealthStoreAutoRefresh();
const { environment } = useEnvironmentAndVersionsStore();
const hostingMode = window.defaultConfig.isIntegrated ? "Integrated" : "Standalone";

// Unlike the Platform health menu item, this reports updates even while an instance is degraded or unavailable.
const updatesAvailable = computed(() => platformHealthStore.rows.some((row) => row.upgradeAvailable));
</script>

<template>
  <div class="version-info" :class="{ collapsed }">
    <span class="version-text"><span class="sr-only">ServicePulse </span>v{{ environment.sp_version }} · {{ hostingMode }}</span>
    <RouterLink v-if="updatesAvailable" class="update-status" :to="routeLinks.platformHealth" v-tippy="'Updates available'">
      <FAIcon class="updates-icon" :icon="faArrowTurnUp" />
      <span class="sr-only">Updates available</span>
    </RouterLink>
    <span v-else class="update-status" v-tippy="'Platform up to date'">
      <FAIcon class="up-to-date-icon" :icon="faCircleCheck" />
      <span class="sr-only">Platform up to date</span>
    </span>
  </div>
</template>

<style scoped>
.version-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  padding: 2px 16px 2px 24px;
  background-color: var(--sp-chrome-strip);
  font-size: 11px;
  color: var(--sp-chrome-strip-ink);
}

.version-info.collapsed {
  justify-content: center;
  padding: 2px 0;
}

.version-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.update-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: var(--sp-radius-sm);
}

a.update-status:hover {
  background-color: var(--sp-chrome-hover);
}

a.update-status:focus-visible {
  outline: 2px solid #fff;
}

.updates-icon {
  color: var(--sp-blue);
}

.up-to-date-icon {
  color: var(--sp-healthy);
}

.collapsed .version-text {
  display: none;
}

@media (max-width: 767px) {
  .version-info.collapsed {
    justify-content: flex-start;
    padding: 2px 16px 2px 24px;
  }

  .collapsed .version-text {
    display: block;
  }
}
</style>
