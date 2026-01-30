<script setup lang="ts">
import { ref, onMounted } from "vue";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import FAIcon from "@/components/FAIcon.vue";
import { useAuth } from "@/composables/useAuth";
import type { User } from "oidc-client-ts";

const { getUser, logout } = useAuth();
const user = ref<User | null>(null);

onMounted(async () => {
  user.value = await getUser();
});

async function handleLogout() {
  await logout();
}
</script>

<template>
  <div v-if="user" class="dropdown user-profile-menu">
    <a href="#" class="dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      <FAIcon :icon="faUser" title="User Profile" />
      <span class="navbar-label">{{ user.profile.name || user.profile.email || "User" }}</span>
    </a>
    <ul class="dropdown-menu dropdown-menu-end">
      <li class="user-info">
        <span class="user-name">{{ user.profile.name || "User" }}</span>
        <span v-if="user.profile.email" class="user-email">{{ user.profile.email }}</span>
      </li>
      <li><hr class="dropdown-divider" /></li>
      <li>
        <button type="button" @click="handleLogout">Log out</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
@import "@/assets/navbar.css";
@import "@/assets/header-menu-item.css";
@import "@/assets/dropdown.css";

.user-profile-menu {
  max-width: 185px;
}

.user-profile-menu .dropdown-toggle {
  display: block;
  color: var(--bs-link-color);
  text-decoration: none;
  padding: 10px 15px;
}

.user-profile-menu .dropdown-toggle:hover {
  color: #fff;
}

.user-profile-menu .dropdown-menu {
  min-width: 200px;
  position: absolute;
}

.user-profile-menu .navbar-label {
  margin-left: 8px;
}

@media (min-width: 768px) {
  .user-profile-menu .dropdown-toggle {
    padding-bottom: 15px;
    padding-top: 20px;
  }
}

@media (max-width: 1439px) {
  .user-profile-menu .dropdown-toggle {
    padding-top: 18px;
    padding-bottom: 17px;
  }
}

.user-info {
  padding: 8px 20px;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.user-email {
  font-size: 12px;
  color: #666;
}

.dropdown-menu > li > button {
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  padding: 6px 20px;
  cursor: pointer;
  color: #333;
}

.dropdown-menu > li > button:hover {
  background-color: #f5f5f5;
}
</style>
