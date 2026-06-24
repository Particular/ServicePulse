<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import FAIcon from "@/components/FAIcon.vue";
import { usePermissionsStore } from "@/stores/PermissionsStore";
import { usePermissions } from "@/composables/usePermissions";

const store = usePermissionsStore();
const { user, permissions, loadAttempted } = storeToRefs(store);
const { fetchDescriptor } = usePermissions();

// Permission strings are "instance:resource:action" (e.g. error:messages:retry).
// We render one table per instance (Error/Audit/Monitoring), feature per row, action per
// column, with a checkmark where the action is granted. All tables share the SAME columns
// (ordered so the most widely shared actions come first: View, Delete, then the rest), so
// the columns line up across instances. A column only shows its header label and checks for
// instances that actually use it; otherwise it stays blank, keeping every table the same
// width. Features and instances with no granted permission are omitted.
const INSTANCE_ORDER = ["error", "audit", "monitoring"];
const INSTANCE_LABELS: Record<string, string> = { error: "Error", audit: "Audit", monitoring: "Monitoring" };
// Only the multi-word resources need a label; the rest are capitalized.
const RESOURCE_LABELS: Record<string, string> = {
  customchecks: "Custom checks",
  recoverabilitygroups: "Recoverability groups",
  eventlog: "Event log",
};
const ACTION_LABELS: Record<string, string> = {};
const ACTION_ORDER = ["view", "retry", "edit", "archive", "unarchive", "manage", "test", "delete"];

function label(code: string, overrides: Record<string, string>): string {
  return overrides[code] ?? code.charAt(0).toUpperCase() + code.slice(1);
}

function rank(code: string, order: string[]): number {
  const index = order.indexOf(code);
  return index === -1 ? order.length : index;
}

interface Column {
  action: string;
  label: string;
}
interface FeatureRow {
  resource: string;
  label: string;
  actions: Set<string>;
  permissions: string[];
}
interface InstanceGroup {
  instance: string;
  label: string;
  used: Set<string>;
  features: FeatureRow[];
}
interface PermissionView {
  columns: Column[];
  instances: InstanceGroup[];
}

const view = computed<PermissionView>(() => {
  const byInstance = new Map<string, Map<string, Set<string>>>();
  const actionInstances = new Map<string, Set<string>>();

  for (const permission of permissions.value) {
    const [instance, resource, action] = permission.split(":");
    if (!instance || !resource || !action) continue;

    let features = byInstance.get(instance);
    if (!features) {
      features = new Map();
      byInstance.set(instance, features);
    }
    let actions = features.get(resource);
    if (!actions) {
      actions = new Set();
      features.set(resource, actions);
    }
    actions.add(action);

    let instancesWithAction = actionInstances.get(action);
    if (!instancesWithAction) {
      instancesWithAction = new Set();
      actionInstances.set(action, instancesWithAction);
    }
    instancesWithAction.add(instance);
  }

  // Shared columns, most widely shared first, so they align across the instance tables.
  const columns = [...actionInstances.entries()]
    .sort(([actionA, instancesA], [actionB, instancesB]) => instancesB.size - instancesA.size || rank(actionA, ACTION_ORDER) - rank(actionB, ACTION_ORDER) || actionA.localeCompare(actionB))
    .map(([action]) => ({ action, label: label(action, ACTION_LABELS) }));

  const instances = [...byInstance.entries()]
    .sort(([a], [b]) => rank(a, INSTANCE_ORDER) - rank(b, INSTANCE_ORDER) || a.localeCompare(b))
    .map(([instance, features]) => {
      const used = new Set<string>();
      for (const featureActions of features.values()) {
        for (const action of featureActions) used.add(action);
      }
      const featureRows = [...features.entries()]
        .map(([resource, featureActions]) => ({
          resource,
          label: label(resource, RESOURCE_LABELS),
          actions: featureActions,
          // The full permission strings the user holds for this feature, shown on hover.
          permissions: [...featureActions].sort((a, b) => rank(a, ACTION_ORDER) - rank(b, ACTION_ORDER) || a.localeCompare(b)).map((action) => `${instance}:${resource}:${action}`),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      return { instance, label: label(instance, INSTANCE_LABELS), used, features: featureRows };
    });

  return { columns, instances };
});

onMounted(() => {
  // Normally already loaded at app start; ensures the page works on direct navigation.
  fetchDescriptor();
});
</script>

<template>
  <section name="user-permissions">
    <div class="box">
      <h3>Your permissions</h3>
      <p class="user-label">{{ user || "Unknown user" }}</p>

      <template v-if="view.instances.length">
        <section v-for="group in view.instances" :key="group.instance" class="instance">
          <h4 class="instance-title">{{ group.label }}</h4>
          <div class="table-scroll">
            <table class="permissions-table">
              <colgroup>
                <col class="feature-col-width" />
                <col v-for="column in view.columns" :key="column.action" class="action-col-width" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" class="feature-col">Feature</th>
                  <th scope="col" v-for="column in view.columns" :key="column.action">
                    <span v-if="group.used.has(column.action)">{{ column.label }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="feature in group.features" :key="feature.resource">
                  <td class="feature-col" v-tippy="{ content: feature.permissions.join('<br>'), allowHTML: true }">{{ feature.label }}</td>
                  <td v-for="column in view.columns" :key="column.action">
                    <FAIcon v-if="feature.actions.has(column.action)" :icon="faCheck" class="check" :aria-label="`${feature.label} ${column.label} allowed`" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>

      <p v-else-if="loadAttempted" class="empty">No permissions are granted to this user.</p>
    </div>
  </section>
</template>

<style scoped>
.user-label {
  color: #6c757d;
  margin-bottom: 28px;
}

.instance {
  margin-bottom: 32px;
}
.instance:last-child {
  margin-bottom: 0;
}

.instance-title {
  font-size: 16px;
  font-weight: 600;
  color: #2a2a2a;
  margin: 0 0 8px;
}

.table-scroll {
  overflow-x: auto;
}

.permissions-table {
  border-collapse: collapse;
  table-layout: fixed;
}

.feature-col-width {
  width: 220px;
}

/* Fixed, compact action columns so the table shrinks to fit and stays left-aligned;
   a view-only user sees just "Feature | View" together instead of a stretched column. */
.action-col-width {
  width: 90px;
}

.permissions-table th,
.permissions-table td {
  padding: 8px 12px;
  text-align: center;
  font-size: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.permissions-table thead th {
  font-weight: 600;
  color: #6c757d;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
}

/* More specific than the generic ".permissions-table td { text-align: center }" so the
   feature names actually left-align. */
.permissions-table th.feature-col,
.permissions-table td.feature-col {
  text-align: left;
}

td.feature-col {
  font-weight: 600;
  color: #2a2a2a;
  /* Hover shows the exact permission strings held for this feature. */
  cursor: help;
}

.check {
  color: #28a745;
}
</style>
