<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { usePermissionsStore } from "@/stores/PermissionsStore";
import { usePermissions } from "@/composables/usePermissions";

const store = usePermissionsStore();
const { user, permissions, loadAttempted } = storeToRefs(store);
const { fetchDescriptor } = usePermissions();

// Sorted for a stable, readable list.
const sortedPermissions = computed(() => [...permissions.value].sort());

onMounted(() => {
  // Normally already loaded at app start; ensures the page works on direct navigation.
  fetchDescriptor();
});
</script>

<template>
  <section name="user-permissions">
    <div class="box">
      <div class="row">
        <div class="col-12">
          <h3>Your permissions</h3>
          <p class="user-label">User: {{ user || "—" }}</p>
          <ul v-if="sortedPermissions.length" class="permissions-list">
            <li v-for="permission in sortedPermissions" :key="permission">{{ permission }}</li>
          </ul>
          <p v-else-if="loadAttempted" class="user-label">No permissions are granted to this user.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
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
