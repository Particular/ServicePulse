<script setup lang="ts">
import FAIcon from "@/components/FAIcon.vue";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

export interface BannerMessage {
  title: string;
  description: string;
}

defineProps<{
  message: BannerMessage;
  showAction?: boolean;
  actionLabel?: string;
}>();

defineEmits<{
  action: [];
}>();
</script>

<template>
  <div class="capability-banner">
    <div class="banner-content">
      <FAIcon :icon="faInfoCircle" class="banner-icon" />
      <div class="banner-text">
        <strong>{{ message.title }}</strong>
        <p>{{ message.description }}</p>
      </div>
      <button v-if="showAction" class="banner-link" @click="$emit('action')">
        {{ actionLabel ?? "Get Started" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.capability-banner {
  background: linear-gradient(135deg, #f6f9fc 0%, #e9f2f9 100%);
  border: 1px solid #c3ddf5;
  border-left: 4px solid #007bff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 1rem;
}

.banner-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.banner-icon {
  font-size: 24px;
  flex-shrink: 0;
  color: #007bff;
}

.banner-text {
  flex: 1;
}

.banner-text strong {
  display: block;
  margin-bottom: 4px;
  color: #333;
  font-size: 14px;
}

.banner-text p {
  margin: 0;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}

.banner-link {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  align-self: center;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.banner-link:hover {
  background-color: #0056b3;
}
</style>
