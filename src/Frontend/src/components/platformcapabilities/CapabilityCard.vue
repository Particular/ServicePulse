<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import FAIcon from "@/components/FAIcon.vue";
import { faCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import type { StatusIndicator, WizardPage } from "@/components/platformcapabilities/types";
import { Capability, CapabilityStatus } from "@/components/platformcapabilities/constants";
import WizardDialog from "./WizardDialog.vue";

const router = useRouter();

const emit = defineEmits<{
  hide: [];
}>();

const props = defineProps<{
  status: CapabilityStatus;
  title: Capability;
  subtitle: string;
  helpButtonText: string;
  helpButtonUrl: string;
  description: string;
  indicators?: StatusIndicator[];
  isLoading?: boolean;
  wizardPages?: WizardPage[];
}>();

const showWizard = ref(false);

const shouldShowWizard = computed(() => {
  return props.wizardPages && props.wizardPages.length > 0 && (props.status === CapabilityStatus.EndpointsNotConfigured || props.status === CapabilityStatus.InstanceNotConfigured);
});

const dataStatus = computed(() => (props.isLoading ? "loading" : props.status.toLowerCase().replace(/ /g, "-")));

function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

function handleButtonClick() {
  if (shouldShowWizard.value) {
    showWizard.value = true;
  } else if (isExternalUrl(props.helpButtonUrl)) {
    window.open(props.helpButtonUrl, "_blank");
  } else {
    router.push(props.helpButtonUrl);
  }
}
</script>

<template>
  <div class="capability-card" data-testid="capability-card" :data-status="dataStatus">
    <div v-if="props.isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading {{ props.title }} capability status...</div>
    </div>
    <div v-if="!props.isLoading" class="capability-header">
      <div class="capability-title-row">
        <h6 class="capability-title">{{ props.title }}</h6>
        <div v-if="props.indicators" class="status-indicators">
          <div v-for="indicator in props.indicators" :key="indicator.label" class="indicator-item" data-testid="status-indicator" v-tippy="indicator.tooltip">
            <FAIcon
              :icon="faCircle"
              class="indicator-light"
              :class="{
                'light-success': indicator.status === CapabilityStatus.Available,
                'light-warning': indicator.status === CapabilityStatus.EndpointsNotConfigured || indicator.status === CapabilityStatus.PartiallyUnavailable,
                'light-danger': indicator.status === CapabilityStatus.Unavailable,
              }"
            />
            <span class="indicator-label">{{ indicator.label }}</span>
          </div>
        </div>
        <div class="title-row-actions">
          <span
            v-if="props.status !== CapabilityStatus.EndpointsNotConfigured && props.status !== CapabilityStatus.InstanceNotConfigured"
            class="status-badge"
            :class="{
              'status-available': props.status === CapabilityStatus.Available,
              'status-unavailable': props.status === CapabilityStatus.Unavailable,
              'status-partially-unavailable': props.status === CapabilityStatus.PartiallyUnavailable,
            }"
          >
            {{ props.status }}
          </span>
          <button class="hide-card-btn" @click="emit('hide')" v-tippy="'Hide this card'">
            <FAIcon :icon="faTimes" />
          </button>
        </div>
      </div>
      <div class="capability-subtitle">{{ props.subtitle }}</div>
    </div>
    <div v-if="!props.isLoading" class="capability-footer">
      <div class="capability-description">
        {{ props.description }}
      </div>
      <button class="btn btn-primary" @click="handleButtonClick">
        {{ props.helpButtonText }}
      </button>
    </div>

    <WizardDialog v-if="showWizard && wizardPages" :title="`Getting Started with ${props.title}`" :pages="wizardPages" @close="showWizard = false" />
  </div>
</template>

<style scoped>
.capability-card {
  background: #fff;
  border-top: 1px solid #eee;
  border-right: 1px solid #fff;
  border-bottom: 1px solid #eee;
  border-left: 1px solid #fff;
  padding: 20px;
  position: relative;
  min-height: 150px;
}

.hide-card-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 12px;
  flex-shrink: 0;
}

.hide-card-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: var(--sp-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 12px;
  color: #666;
  font-size: 14px;
}

.capability-header {
  margin-bottom: 12px;
}

.capability-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.capability-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.status-indicators {
  display: flex;
  gap: 12px;
  align-items: center;
}

.indicator-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: help;
}

.indicator-light {
  font-size: 10px;
}

.light-success {
  color: #28a745;
}

.light-warning {
  color: #ffc107;
}

.light-danger {
  color: #dc3545;
}

.indicator-label {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.capability-subtitle {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.title-row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

.status-badge {
  white-space: nowrap;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-available {
  background-color: #d4edda;
  color: #155724;
}

.status-unavailable {
  background-color: #f8d7da;
  color: #721c24;
}

.status-partially-unavailable {
  background-color: #fff3cd;
  color: #856404;
}

.capability-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.capability-description {
  flex: 1;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}
</style>
