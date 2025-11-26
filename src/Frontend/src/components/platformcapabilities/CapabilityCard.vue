<script setup lang="ts">
import { ref, computed } from "vue";
import FAIcon from "@/components/FAIcon.vue";
import { IconDefinition, faCircle } from "@fortawesome/free-solid-svg-icons";
import { StatusIndicator, WizardPage } from "@/components/platformcapabilities/types";
import { Capability, CapabilityStatus } from "@/components/platformcapabilities/constants";
import WizardDialog from "./WizardDialog.vue";

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
@import "@/components/platformcapabilities/styles/capabilityCard.css";
</style>
