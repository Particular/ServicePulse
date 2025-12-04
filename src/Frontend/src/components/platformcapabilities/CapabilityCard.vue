<script setup lang="ts">
import { ref, computed } from "vue";
import FAIcon from "@/components/FAIcon.vue";
import { IconDefinition, faCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { StatusIndicator, WizardPage } from "@/components/platformcapabilities/types";
import { Capability, CapabilityStatus } from "@/components/platformcapabilities/constants";
import WizardDialog from "./WizardDialog.vue";

const emit = defineEmits<{
  hide: [];
}>();

const props = defineProps<{
  status: CapabilityStatus;
  icon: IconDefinition;
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

function handleButtonClick() {
  if (shouldShowWizard.value) {
    showWizard.value = true;
  } else {
    window.open(props.helpButtonUrl, props.status !== CapabilityStatus.Available ? "_blank" : "_self");
  }
}
</script>

<template>
  <div
    class="capability-card"
    data-testid="capability-card"
    :class="{
      'capability-available': !props.isLoading && props.status === CapabilityStatus.Available,
      'capability-unavailable': !props.isLoading && props.status === CapabilityStatus.Unavailable,
      'capability-partially-unavailable': !props.isLoading && props.status === CapabilityStatus.PartiallyUnavailable,
      'capability-loading': props.isLoading,
      'capability-notconfigured': !props.isLoading && (props.status === CapabilityStatus.EndpointsNotConfigured || props.status === CapabilityStatus.InstanceNotConfigured),
    }"
  >
    <div v-if="props.isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading {{ props.title }} capability status...</div>
    </div>
    <button class="hide-card-btn" @click="emit('hide')" v-tippy="'Hide this card'">
      <FAIcon :icon="faTimes" />
    </button>
    <div v-if="!props.isLoading" class="capability-header">
      <FAIcon
        :icon="props.icon"
        class="capability-icon"
        :class="{
          'text-success': props.status === CapabilityStatus.Available,
          'text-danger': props.status === CapabilityStatus.Unavailable,
          'text-warning': props.status === CapabilityStatus.PartiallyUnavailable,
          'text-info': props.status === CapabilityStatus.EndpointsNotConfigured || props.status === CapabilityStatus.InstanceNotConfigured,
        }"
      />
      <div class="capability-info">
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
        </div>
        <div class="capability-subtitle">{{ props.subtitle }}</div>
      </div>
      <div v-if="props.status !== CapabilityStatus.EndpointsNotConfigured && props.status !== CapabilityStatus.InstanceNotConfigured" class="capability-status">
        <span
          class="status-badge"
          :class="{
            'status-available': props.status === CapabilityStatus.Available,
            'status-unavailable': props.status === CapabilityStatus.Unavailable,
            'status-partially-unavailable': props.status === CapabilityStatus.PartiallyUnavailable,
          }"
        >
          {{ props.status }}
        </span>
      </div>
    </div>
    <div v-if="!props.isLoading" class="capability-footer">
      <div class="capability-description">
        {{ props.description }}
      </div>
      <button class="btn-primary learn-more-btn" @click="handleButtonClick">
        {{ props.helpButtonText }}
      </button>
    </div>

    <WizardDialog v-if="showWizard && wizardPages" :title="`Getting Started with ${props.title}`" :pages="wizardPages" @close="showWizard = false" />
  </div>
</template>

<style scoped>
.capability-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  position: relative;
  min-height: 150px;
}

.hide-card-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-secondary, #999);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s ease;
  font-size: 12px;
  z-index: 5;
}

.capability-card:hover .hide-card-btn {
  opacity: 1;
}

.hide-card-btn:hover {
  background-color: var(--hover-bg, #f0f0f0);
  color: var(--text-primary, #333);
}

.capability-available {
  border-left: 4px solid var(--success-color, #28a745);
}

.capability-unavailable {
  border-left: 4px solid var(--danger-color, #dc3545);
}

.capability-partially-unavailable {
  border-left: 4px solid var(--warning-color, #ffc107);
}

.capability-loading {
  border-left: 4px solid var(--border-color, #e0e0e0);
}

.capability-notconfigured {
  background: linear-gradient(135deg, #f6f9fc 0%, #e9f2f9 100%);
  border: 1px solid #c3ddf5;
  border-left: 4px solid #007bff;
}

.text-info {
  color: #007bff;
}

.text-warning {
  color: var(--warning-color, #ffc107);
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
  border-radius: 8px;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color, #e0e0e0);
  border-top-color: var(--primary-color, #007bff);
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
  color: var(--text-secondary, #666);
  font-size: 14px;
}

.capability-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.capability-icon {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.capability-info {
  flex: 1;
  min-width: 0;
}

.capability-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.capability-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #333);
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
  color: var(--success-color, #28a745);
}

.light-warning {
  color: var(--warning-color, #ffc107);
}

.light-danger {
  color: var(--danger-color, #dc3545);
}

.indicator-label {
  font-size: 12px;
  color: var(--text-secondary, #666);
  white-space: nowrap;
}

.capability-subtitle {
  font-size: 14px;
  color: var(--text-secondary, #666);
  line-height: 1.4;
}

.capability-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.status-badge {
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
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e0e0e0);
}

.capability-description {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary, #666);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.learn-more-btn {
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  border: 1px solid transparent;
}

.learn-more-btn.btn-primary {
  background-color: var(--primary-color, #007bff);
  color: white;
  border-color: var(--primary-color, #007bff);
}

.learn-more-btn.btn-primary:hover {
  background-color: var(--primary-hover-color, #0056b3);
  border-color: var(--primary-hover-color, #0056b3);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .capability-header {
    flex-direction: column;
  }

  .capability-status {
    align-items: flex-start;
    flex-direction: row;
    gap: 8px;
  }

  .capability-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .learn-more-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
