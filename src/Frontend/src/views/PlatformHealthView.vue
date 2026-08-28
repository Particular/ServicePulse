<script setup lang="ts">
import { computed, ref } from "vue";
import LicenseNotExpired from "@/components/LicenseNotExpired.vue";
import ActionButton from "@/components/ActionButton.vue";
import PlatformHealthSupportModal from "@/components/platformhealth/PlatformHealthSupportModal.vue";
import usePlatformHealthStoreAutoRefresh from "@/composables/usePlatformHealthStoreAutoRefresh";
import useEnvironmentAndVersionsAutoRefresh from "@/composables/useEnvironmentAndVersionsAutoRefresh";
import FAIcon from "@/components/FAIcon.vue";
import { faArrowTurnUp } from "@fortawesome/free-solid-svg-icons";

const { store } = usePlatformHealthStoreAutoRefresh();
useEnvironmentAndVersionsAutoRefresh();
const showSupportModal = ref(false);

const issueSummaryClass = computed(() => ({
  "issues-summary": true,
  warning: store.severity === "warning",
  danger: store.severity === "danger",
}));

function openSupportModal() {
  showSupportModal.value = true;
}

function getUpgradeTargetVersion(row: (typeof store.rows)[number]) {
  return row.latestVersion || store.payload?.primary?.version || "";
}

function getUpgradeTargetLink(row: (typeof store.rows)[number]) {
  return row.upgradeLink || `https://github.com/Particular/ServiceControl/releases/tag/${getUpgradeTargetVersion(row)}`;
}

function shouldShowUpgradeCue(row: (typeof store.rows)[number]) {
  const targetVersion = getUpgradeTargetVersion(row);

  return row.upgradeAvailable || (!!targetVersion && row.version !== "Unknown" && row.version !== targetVersion);
}
</script>

<template>
  <LicenseNotExpired>
    <div class="container platform-health-view">
      <div class="row">
        <div class="col-sm-12 page-header-row">
          <div>
            <h1>Platform health</h1>
          </div>
          <ActionButton variant="primary" aria-label="Open support case" @click="openSupportModal">Open support case</ActionButton>
        </div>
      </div>

      <div class="row">
        <div class="col-sm-12">
          <p v-if="store.issueSummary !== 'No issues detected.'" :class="issueSummaryClass">{{ store.issueSummary }}</p>
          <div v-if="store.payload?.warnings.length" class="platform-warning-list alert alert-warning" role="note">
            <div v-for="warning in store.payload.warnings" :key="warning">{{ warning }}</div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-sm-12">
          <section class="panel table-wrap" aria-label="Platform health table">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Instance name</th>
                  <th>Version</th>
                  <th>Health</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in store.rows" :key="`${row.type}-${row.instanceName}`">
                  <td class="type-cell">{{ row.type }}</td>
                  <td>
                    <div class="instance-name">{{ row.instanceName }}</div>
                    <div class="instance-note">{{ row.note }}</div>
                  </td>
                  <td>
                    <span>{{ row.version }}</span>
                    <a v-if="shouldShowUpgradeCue(row)" class="upgrade-badge" :href="getUpgradeTargetLink(row)" target="_blank">
                      <FAIcon class="footer-icon fake-link" :icon="faArrowTurnUp" />
                      <span>v{{ getUpgradeTargetVersion(row) }} available</span>
                    </a>
                  </td>
                  <td>
                    <span class="health-badge" :class="row.health">{{ row.health.charAt(0).toUpperCase() + row.health.slice(1) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>

      <PlatformHealthSupportModal v-if="showSupportModal && store.supportDownloadJson" :download-json="store.supportDownloadJson" :support-case-url="store.supportCaseUrl" @close="showSupportModal = false" />
    </div>
  </LicenseNotExpired>
</template>

<style scoped>
.platform-health-view {
  padding-bottom: 2rem;
}

.page-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.lede {
  color: #4c5b5c;
  margin: 0 0 1.5rem;
  max-width: 760px;
}

.issues-summary {
  font-weight: 700;
  margin-bottom: 1rem;
}

.issues-summary.warning {
  color: #9b6200;
}

.issues-summary.danger {
  color: #b53a31;
}

.panel {
  background: #fff;
  border: 1px solid #dfe7e8;
  border-radius: 8px;
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

thead th {
  text-align: left;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #5f6e6f;
  background: #f9fbfb;
  padding: 16px 18px;
  border-bottom: 1px solid #e6ecec;
}

tbody td {
  padding: 18px;
  border-bottom: 1px solid #e6ecec;
  vertical-align: top;
}

tbody tr:last-child td {
  border-bottom: none;
}

.type-cell,
.instance-name {
  font-weight: 700;
}

.type-cell {
  width: 180px;
}

.instance-note {
  color: #617071;
}

.health-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 104px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.health-badge.healthy {
  background: #e3f6ea;
  color: #1f7a3f;
}

.health-badge.degraded {
  background: #fff2d9;
  color: #9b6200;
}

.health-badge.unavailable {
  background: #fde5e3;
  color: #b53a31;
}

.platform-warning-list {
  margin-bottom: 1rem;
}

.footer-icon {
  color: var(--sp-blue);
  margin-right: 4px;
}

.upgrade-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eef7fa;
  color: var(--sp-blue);
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.upgrade-badge:hover {
  color: #007f98;
  background: #dff1f6;
  text-decoration: none;
}

@media (max-width: 600px) {
  .page-header-row {
    flex-direction: column;
  }
}
</style>
