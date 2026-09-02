<script setup lang="ts">
import { computed, ref } from "vue";
import LicenseNotExpired from "@/components/LicenseNotExpired.vue";
import ActionButton from "@/components/ActionButton.vue";
import PlatformHealthSupportModal from "@/components/platformhealth/PlatformHealthSupportModal.vue";
import usePlatformHealthStoreAutoRefresh from "@/composables/usePlatformHealthStoreAutoRefresh";
import useEnvironmentAndVersionsAutoRefresh from "@/composables/useEnvironmentAndVersionsAutoRefresh";
import FAIcon from "@/components/FAIcon.vue";
import { faArrowTurnUp, faChevronDown, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { WarningLevel } from "@/components/WarningLevel";

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

function isExpanded(row: (typeof store.rows)[number]) {
  return expandedRowKey.value === rowKey(row);
}

function chevronClass(row: (typeof store.rows)[number]) {
  return {
    expanded: isExpanded(row),
  };
}

function issueEntries(row: (typeof store.rows)[number]) {
  if (row.type === "ServicePulse") {
    return [];
  }

  const entries: Array<{ summary: string; reportedAt?: string }> = [];

  for (let index = 0; index < row.healthDetails.length; index += 1) {
    const detail = row.healthDetails[index];
    if (detail.startsWith("Reported at:")) {
      continue;
    }

    const nextDetail = row.healthDetails[index + 1];
    entries.push({
      summary: detail,
      reportedAt: nextDetail?.startsWith("Reported at:") ? nextDetail.replace(/^Reported at:\s*/, "") : undefined,
    });

    if (nextDetail?.startsWith("Reported at:")) {
      index += 1;
    }
  }

  return entries;
}

function infoEntries(row: (typeof store.rows)[number]) {
  return row.infoDetails.map((detail) => {
    if (detail.startsWith("API: ")) {
      return {
        label: "API",
        value: detail.substring("API: ".length),
      };
    }

    return {
      label: "Info",
      value: detail,
    };
  });
}

function issueWarningLevel(row: (typeof store.rows)[number]) {
  switch (row.health) {
    case "degraded":
      return WarningLevel.Warning;
    case "unavailable":
      return WarningLevel.Danger;
    default:
      return WarningLevel.None;
  }
}

function issuePanelClass(row: (typeof store.rows)[number]) {
  return {
    warning: row.health === "degraded",
    danger: row.health === "unavailable",
  };
}

function showsNoProblems(row: (typeof store.rows)[number]) {
  return row.type === "ServicePulse" && row.healthDetails.length === 1 && row.healthDetails[0] === "No problems detected.";
}

const healthLabel = computed(() => ({
  healthy: "Healthy",
  degraded: "Degraded",
  unavailable: "Unavailable",
}));

function toggleRow(row: (typeof store.rows)[number]) {
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
                      <span class="instance-name">{{ row.name }}</span>
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
                      <button type="button" class="health-badge health-badge-button" :class="row.health" :aria-expanded="isExpanded(row)" :aria-controls="`${rowKey(row)}-details`" @click="toggleRow(row)">
                        <span>{{ healthLabel[row.health] }}</span>
                        <FAIcon class="health-chevron" :class="chevronClass(row)" :icon="faChevronDown" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="isExpanded(row)" :id="`${rowKey(row)}-details`" class="details-row">
                    <td colspan="4" class="details-cell">
                      <div class="details-stack">
                        <section v-if="issueEntries(row).length > 0" class="details-card details-card-issues" :class="issuePanelClass(row)">
                          <div class="details-card-header">
                            <h3>Health issues</h3>
                          </div>
                          <div class="issue-list">
                            <article v-for="issue in issueEntries(row)" :key="issue.summary + (issue.reportedAt ?? '')" class="issue-item">
                              <FAIcon class="issue-icon" :class="issueWarningLevel(row)" :icon="faTriangleExclamation" />
                              <div class="issue-content">
                                <div class="issue-summary">{{ issue.summary }}</div>
                                <div v-if="issue.reportedAt" class="issue-meta">Reported at: {{ issue.reportedAt }}</div>
                              </div>
                            </article>
                          </div>
                        </section>

                        <section class="details-card details-card-info">
                          <div class="details-card-header">
                            <h3>Information</h3>
                          </div>
                          <table v-if="row.infoDetails.length > 0" class="details-table details-table-info">
                            <tbody>
                              <tr v-for="entry in infoEntries(row)" :key="`${entry.label}-${entry.value}`">
                                <td class="details-table-key">{{ entry.label }}</td>
                                <td>{{ entry.value }}</td>
                              </tr>
                            </tbody>
                          </table>
                          <p v-else-if="showsNoProblems(row)" class="no-problems">No problems detected.</p>
                          <p v-else class="no-problems no-problems-muted">No additional information.</p>
                        </section>
                      </div>
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
  color: #243435;
}

.details-stack {
  display: grid;
  gap: 0.875rem;
  padding: 0.25rem 0 0.5rem;
}

.details-card {
  border: 1px solid #dde5e5;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}

.details-card-issues {
  background: #fffafa;
}

.details-card-issues.warning {
  border-left: 4px solid var(--bs-warning);
  background: #fffdf2;
}

.details-card-issues.danger {
  border-left: 4px solid #b53a31;
  background: #fffafa;
}

.details-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f2;
}

.details-card-header h3 {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #4c5b5c;
}

.issue-list {
  display: grid;
  gap: 0.75rem;
  padding: 14px 16px 16px;
}

.issue-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.issue-icon {
  margin-top: 0.2rem;
  font-size: 14px;
  flex: none;
}

.issue-icon.warning {
  color: var(--bs-warning);
}

.issue-icon.danger {
  color: #b53a31;
}

.issue-content {
  display: grid;
  gap: 0.15rem;
}

.issue-summary {
  font-weight: 700;
  color: #2c3839;
}

.issue-meta {
  color: #73544d;
  font-size: 12px;
}

.details-card-info .details-table,
.details-card-info .no-problems {
  margin: 0;
  padding: 14px 16px 16px;
}

.details-table {
  width: 100%;
  border-collapse: collapse;
}

.details-table td {
  padding: 0.4rem 0;
  vertical-align: top;
  border-bottom: 1px solid #eef2f2;
}

.details-table tr:last-child td {
  border-bottom: none;
}

.details-table-key {
  width: 112px;
  color: #4c5b5c;
  font-weight: 500;
  text-align: center;
  padding-right: 1rem;
}

.details-table td {
  color: #617071;
  word-break: break-word;
}

.no-problems {
  color: #4c5b5c;
}

.no-problems-muted {
  color: #748081;
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
  gap: 0.375rem;
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

.health-chevron {
  font-size: 10px;
  transition: transform 0.15s ease;
}

.health-chevron.expanded {
  transform: rotate(180deg);
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

.details-list-info {
  color: #617071;
  margin-bottom: 0.5rem;
}

.details-list-status {
  color: #354243;
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
