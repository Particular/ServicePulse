<script setup lang="ts">
import { onMounted } from "vue";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import FAIcon from "@/components/FAIcon.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { useUserPermissionsStore } from "@/stores/UserPermissionsStore";

const store = useUserPermissionsStore();

onMounted(async () => {
  await store.refresh();
});
</script>

<template>
  <section name="user-permissions">
    <div class="box">
      <LoadingSpinner v-if="store.loading" />
      <div v-else-if="store.error" class="alert alert-danger">{{ store.error }}</div>
      <template v-else-if="store.summary && store.descriptor">
        <div class="row">
          <div class="col-12">
            <h3>Permissions Summary</h3>
            <table class="table permissions-table">
              <thead>
                <tr>
                  <th>Area</th>
                  <th class="text-center">Read</th>
                  <th class="text-center">Write</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Failed Messages</td>
                  <td class="text-center">
                    <FAIcon :icon="store.summary.failed_messages_read ? faCheck : faTimes" :class="store.summary.failed_messages_read ? 'icon-granted' : 'icon-denied'" />
                  </td>
                  <td class="text-center">
                    <FAIcon :icon="store.summary.failed_messages_write ? faCheck : faTimes" :class="store.summary.failed_messages_write ? 'icon-granted' : 'icon-denied'" />
                  </td>
                </tr>
                <tr>
                  <td>Auditing</td>
                  <td class="text-center">
                    <FAIcon :icon="store.summary.auditing_read ? faCheck : faTimes" :class="store.summary.auditing_read ? 'icon-granted' : 'icon-denied'" />
                  </td>
                  <td class="text-center">—</td>
                </tr>
                <tr>
                  <td>Monitoring</td>
                  <td class="text-center">
                    <FAIcon :icon="store.summary.monitoring_read ? faCheck : faTimes" :class="store.summary.monitoring_read ? 'icon-granted' : 'icon-denied'" />
                  </td>
                  <td class="text-center">
                    <FAIcon :icon="store.summary.monitoring_write ? faCheck : faTimes" :class="store.summary.monitoring_write ? 'icon-granted' : 'icon-denied'" />
                  </td>
                </tr>
                <tr>
                  <td>Admin</td>
                  <td class="text-center">
                    <FAIcon :icon="store.summary.admin_read ? faCheck : faTimes" :class="store.summary.admin_read ? 'icon-granted' : 'icon-denied'" />
                  </td>
                  <td class="text-center">
                    <FAIcon :icon="store.summary.admin_write ? faCheck : faTimes" :class="store.summary.admin_write ? 'icon-granted' : 'icon-denied'" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <h3>All Permissions</h3>
            <p class="user-label">User: {{ store.descriptor.user }}</p>
            <ul class="permissions-list">
              <li v-for="permission in store.descriptor.permissions" :key="permission">{{ permission }}</li>
            </ul>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.permissions-table {
  max-width: 480px;
}

.permissions-table th,
.permissions-table td {
  padding: 10px 16px;
}

.icon-granted {
  color: #28a745;
}

.icon-denied {
  color: #dc3545;
}

.user-label {
  color: #666;
  margin-bottom: 12px;
}

.permissions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: monospace;
  font-size: 13px;
}

.permissions-list li {
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.permissions-list li:last-child {
  border-bottom: none;
}
</style>
