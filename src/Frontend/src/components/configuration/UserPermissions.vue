<script lang="ts">
import { ApiRoutes, type ApplicationCapabilityGroup } from "@/composables/apiRoutes";

// Static capability groupings: each area lists the API routes the user may or may not be able to call.
// Permissions are derived at render time from canCall — no permission strings are involved.
// Defined at module scope (outside setup) so it is shared across component instances.
export const groups: ApplicationCapabilityGroup[] = [
  {
    area: "Failed messages",
    capabilities: [
      { label: "View", ref: ApiRoutes.viewFailedMessages },
      { label: "Retry", ref: ApiRoutes.retryMessage },
      { label: "Edit", ref: ApiRoutes.editMessage },
      { label: "Delete", ref: ApiRoutes.deleteMessage },
      { label: "Restore", ref: ApiRoutes.restoreMessage },
    ],
  },
  {
    area: "Recoverability groups",
    capabilities: [
      { label: "Retry group", ref: ApiRoutes.retryGroup },
      { label: "Delete group", ref: ApiRoutes.deleteGroup },
      { label: "Restore group", ref: ApiRoutes.restoreGroup },
    ],
  },
  {
    area: "Audit",
    capabilities: [{ label: "View", ref: ApiRoutes.viewAuditMessages }],
  },
  {
    area: "Monitoring",
    capabilities: [
      { label: "View", ref: ApiRoutes.viewMonitoredEndpoints },
      { label: "Remove endpoint", ref: ApiRoutes.deleteMonitoredEndpoint },
    ],
  },
  {
    area: "Custom checks",
    capabilities: [
      { label: "View", ref: ApiRoutes.viewCustomChecks },
      { label: "Dismiss", ref: ApiRoutes.dismissCustomCheck },
    ],
  },
  {
    area: "Event log",
    capabilities: [{ label: "View", ref: ApiRoutes.viewEventLog }],
  },
  {
    area: "Configuration — License",
    capabilities: [{ label: "View", ref: ApiRoutes.viewLicense }],
  },
  {
    area: "Configuration — Connections",
    capabilities: [{ label: "View", ref: ApiRoutes.viewConnections }],
  },
  {
    area: "Configuration — Notifications",
    capabilities: [
      { label: "View", ref: ApiRoutes.viewNotifications },
      { label: "Manage", ref: ApiRoutes.manageNotifications },
      { label: "Test", ref: ApiRoutes.testNotifications },
    ],
  },
  {
    area: "Configuration — Redirects",
    capabilities: [
      { label: "View", ref: ApiRoutes.viewRedirects },
      { label: "Manage", ref: ApiRoutes.manageRedirects },
    ],
  },
  {
    area: "Configuration — Endpoints",
    capabilities: [
      { label: "View", ref: ApiRoutes.viewEndpoints },
      { label: "View heartbeats", ref: ApiRoutes.viewHeartbeats },
      { label: "Manage heartbeat tracking", ref: ApiRoutes.manageEndpointSettings },
      { label: "Remove instance", ref: ApiRoutes.deleteEndpointInstance },
    ],
  },
  {
    area: "Configuration — Throughput",
    capabilities: [
      { label: "View", ref: ApiRoutes.viewThroughput },
      { label: "Manage", ref: ApiRoutes.manageThroughput },
    ],
  },
];
</script>

<script setup lang="ts">
import { computed } from "vue";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import FAIcon from "@/components/FAIcon.vue";
import ConditionalRender from "@/components/ConditionalRender.vue";
import { useAllowedRoutes } from "@/composables/useAllowedRoutes";

const { canCall, supported, roles } = useAllowedRoutes();

const rows = computed(() =>
  groups.map((g) => ({
    area: g.area,
    capabilities: g.capabilities.map((c) => ({ label: c.label, granted: canCall(c.ref) })),
  }))
);
</script>

<template>
  <section name="user-permissions">
    <div class="box">
      <h3>Your permissions</h3>

      <div v-if="roles.length" class="user-roles">
        <span class="roles-label">Roles:</span>
        <span v-for="role in roles" :key="role" class="role-badge">{{ role }}</span>
      </div>

      <ConditionalRender :supported="supported">
        <template #unsupported>
          <div class="container not-supported">
            <div class="row">
              <div class="col-sm-12">
                <div class="text-center message">
                  <p>Viewing your permissions requires a newer version of ServiceControl.</p>
                  <div>
                    <a class="btn btn-default btn-primary" href="https://particular.net/downloads" target="_blank">Update ServiceControl to latest version</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <table class="permissions-table">
          <thead>
            <tr>
              <th scope="col" class="area-col">Area</th>
              <th scope="col" class="cap-col">Capability</th>
              <th scope="col" class="status-col">Allowed</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in rows" :key="row.area">
              <tr v-for="(cap, idx) in row.capabilities" :key="cap.label" class="cap-row">
                <td v-if="idx === 0" :rowspan="row.capabilities.length" class="area-col area-cell">{{ row.area }}</td>
                <td class="cap-col">{{ cap.label }}</td>
                <td class="status-col">
                  <FAIcon v-if="cap.granted" :icon="faCheck" class="check" aria-label="Allowed" />
                  <FAIcon v-else :icon="faXmark" class="deny" aria-label="Not allowed" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </ConditionalRender>
    </div>
  </section>
</template>

<style scoped>
@import "@/components/notsupported.css";

.user-roles {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.roles-label {
  font-weight: 600;
  color: #6c757d;
}

.role-badge {
  padding: 2px 10px;
  font-size: 13px;
  font-weight: 600;
  color: #2a2a2a;
  background-color: #e9ecef;
  border-radius: 12px;
}

.permissions-table {
  border-collapse: collapse;
  table-layout: fixed;
  width: auto;
}

.area-col {
  width: 260px;
}

.cap-col {
  width: 200px;
}

.status-col {
  width: 90px;
  text-align: center;
}

.permissions-table th,
.permissions-table td {
  padding: 8px 12px;
  font-size: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.permissions-table thead th {
  font-weight: 600;
  color: #6c757d;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
  text-align: left;
}

.permissions-table thead th.status-col {
  text-align: center;
}

.area-cell {
  font-weight: 600;
  color: #2a2a2a;
  vertical-align: top;
  padding-top: 10px;
}

.check {
  color: #28a745;
}

.deny {
  color: #dc3545;
}
</style>
