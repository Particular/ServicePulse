<script setup lang="ts">
import { ref } from "vue";
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
const expandedRowKey = ref<string | null>(null);

function openSupportModal() {
  showSupportModal.value = true;
}

function getUpgradeTargetVersion(row: (typeof store.rows)[number]) {
  return row.upgradeAvailable ? row.latestVersion : "";
}

function getUpgradeTargetLink(row: (typeof store.rows)[number]) {
  const targetVersion = getUpgradeTargetVersion(row);
  if (!targetVersion) {
    return "";
  }

  return row.upgradeLink || `https://github.com/Particular/ServiceControl/releases/tag/${targetVersion}`;
}

function shouldShowUpgradeCue(row: (typeof store.rows)[number]) {
  return row.upgradeAvailable && !!getUpgradeTargetVersion(row);
}

function rowKey(row: (typeof store.rows)[number]) {
  return `${row.type}-${row.name}`;
}

function isExpandable(row: (typeof store.rows)[number]) {
  return row.isExpandable && (row.health === "degraded" || row.health === "unavailable");
}

function isExpanded(row: (typeof store.rows)[number]) {
  return expandedRowKey.value === rowKey(row);
}

function toggleRow(row: (typeof store.rows)[number]) {
  if (!isExpandable(row)) {
    return;
  }

  expandedRowKey.value = isExpanded(row) ? null : rowKey(row);
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
          <section class="panel table-wrap" aria-label="Platform health table">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Version</th>
                  <th>Health</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="row in store.rows" :key="rowKey(row)">
                  <tr>
                    <td class="type-cell">{{ row.type }}</td>
                    <td>
                      <a v-if="row.isLink" class="instance-name" :href="row.apiUrl" target="_blank" rel="noopener noreferrer">{{ row.name }}</a>
                      <span v-else class="instance-name">{{ row.name }}</span>
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
                      <button v-if="isExpandable(row)" type="button" class="health-badge health-badge-button" :class="row.health" :aria-expanded="isExpanded(row)" :aria-controls="`${rowKey(row)}-details`" @click="toggleRow(row)">
                        {{ row.health.charAt(0).toUpperCase() + row.health.slice(1) }}
                      </button>
                      <span v-else class="health-badge" :class="row.health">{{ row.health.charAt(0).toUpperCase() + row.health.slice(1) }}</span>
                    </td>
                  </tr>
                  <tr v-if="isExpanded(row)" :id="`${rowKey(row)}-details`" class="details-row">
                    <td colspan="4" class="details-cell">
                      <ul class="details-list">
                        <li v-for="detail in row.details" :key="detail">{{ detail }}</li>
                      </ul>
                    </td>
                  </tr>
                </template>
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

.instance-name {
  color: var(--sp-blue);
  text-decoration: none;
}

.instance-name:hover {
  color: #007f98;
  text-decoration: underline;
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

.health-badge-button {
  border: none;
  cursor: pointer;
}

.health-badge-button:hover {
  filter: brightness(0.97);
}

.health-badge-button:focus-visible {
  outline: 2px solid var(--sp-blue);
  outline-offset: 2px;
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

.details-row td {
  padding-top: 0;
}

.details-cell {
  background: #f9fbfb;
}

.details-list {
  margin: 0;
  padding-left: 1.25rem;
  color: #4c5b5c;
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
