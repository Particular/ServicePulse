<script setup lang="ts">
import { onBeforeMount, ref, useTemplateRef, watch } from "vue";
import { useShowToast } from "../../composables/toast";
import OrderBy from "@/components/OrderBy.vue";
import LicenseNotExpired from "../../components/LicenseNotExpired.vue";
import ServiceControlAvailable from "../ServiceControlAvailable.vue";
import MessageList, { IMessageList } from "./MessageList.vue";
import ConfirmDialog from "../ConfirmDialog.vue";
import PaginationStrip from "../../components/PaginationStrip.vue";
import { FailedMessageStatus } from "@/resources/FailedMessage";
import SortOptions from "@/resources/SortOptions";
import { TYPE } from "vue-toastification";
import GroupOperation from "@/resources/GroupOperation";
import { faArrowDownAZ, faArrowDownZA, faArrowDownShortWide, faArrowDownWideShort, faInfoCircle, faExternalLink, faFilter, faTimes, faArrowRightRotate } from "@fortawesome/free-solid-svg-icons";
import FAIcon from "@/components/FAIcon.vue";
import ActionButton from "@/components/ActionButton.vue";
import { faCheckSquare } from "@fortawesome/free-regular-svg-icons";
import { useConfigurationStore } from "@/stores/ConfigurationStore";
import { storeToRefs } from "pinia";
import { useStoreAutoRefresh } from "@/composables/useAutoRefresh";
import { RetryPeriodOption, useRecoverabilityStore } from "@/stores/RecoverabilityStore";

const loading = ref(false);
const { autoRefresh, isRefreshing } = useStoreAutoRefresh("recoverabilityStore", useRecoverabilityStore, 5000);
const { store } = autoRefresh();
const { messages, totalCount, pageNumber, selectedPeriod, selectedQueue, endpoints } = storeToRefs(store);
const configurationStore = useConfigurationStore();
const { isMassTransitConnected } = storeToRefs(configurationStore);

const messageList = useTemplateRef<IMessageList>("messageList");
const showConfirmRetry = ref(false);
const showConfirmResolve = ref(false);
const showConfirmResolveAll = ref(false);
const showCantRetryAll = ref(false);
const showRetryAllConfirm = ref(false);
const sortOptions: SortOptions<GroupOperation>[] = [
  {
    description: "Time of failure",
    iconAsc: faArrowDownShortWide,
    iconDesc: faArrowDownWideShort,
  },
  {
    description: "Message Type",
    iconAsc: faArrowDownAZ,
    iconDesc: faArrowDownZA,
  },
  {
    description: "Time of retry request",
    iconAsc: faArrowDownShortWide,
    iconDesc: faArrowDownWideShort,
  },
];

function numberDisplayed() {
  return messageList.value?.numberDisplayed();
}

function isAnythingDisplayed() {
  return messageList.value?.isAnythingDisplayed();
}

function isAnythingSelected() {
  return messageList.value?.isAnythingSelected();
}

function numberSelected() {
  return messageList.value?.getSelectedMessages()?.length ?? 0;
}

async function retrySelectedMessages() {
  const selectedMessages = messageList.value?.getSelectedMessages() ?? [];

  useShowToast(TYPE.INFO, "Info", "Selected messages were submitted for retry...");
  await store.retryById(selectedMessages.map((m) => m.id));

  messageList.value?.deselectAll();
  selectedMessages.forEach((m) => (m.submittedForRetrial = true));
}

async function resolveSelectedMessages() {
  const selectedMessages = messageList.value?.getSelectedMessages() ?? [];

  useShowToast(TYPE.INFO, "Info", "Selected messages were marked as resolved.");
  await store.resolveById(selectedMessages.map((m) => m.id));
  messageList.value?.deselectAll();
  selectedMessages.forEach((m) => (m.resolved = true));
}

async function resolveAllMessages() {
  useShowToast(TYPE.INFO, "Info", "All filtered messages were marked as resolved.");
  await store.resolveAll();
  messageList.value?.deselectAll();
  messageList.value?.resolveAll();
}

async function retryAllMessages() {
  await store.retryAll();
  messages.value.forEach((message) => {
    message.selected = false;
    message.submittedForRetrial = true;
    message.retried = false;
  });
}

function retryAllClicked() {
  if (selectedQueue.value === "empty") {
    showCantRetryAll.value = true;
  } else {
    showRetryAllConfirm.value = true;
  }
}

async function sortGroups(sort: SortOptions<GroupOperation>) {
  loading.value = true;
  await store.setSort(sort.description.replaceAll(" ", "_").toLowerCase(), sort.dir);
  loading.value = false;
}

async function periodChanged(period: RetryPeriodOption) {
  loading.value = true;
  await store.setPeriod(period);
  loading.value = false;
}

onBeforeMount(async () => {
  loading.value = true;
  //set status before mount to ensure no other controls/processes can cause extra refreshes during mount
  await store.setMessageStatus(FailedMessageStatus.RetryIssued);
});
watch(isRefreshing, () => {
  if (!isRefreshing.value && loading.value) loading.value = false;
});
</script>

<template>
  <ServiceControlAvailable>
    <LicenseNotExpired>
      <section name="pending_retries">
        <div class="row">
          <div class="col-12">
            <div class="alert alert-info">
              <FAIcon :icon="faInfoCircle" class="icon info" /> To check if a retried message was also processed successfully, enable
              <a href="https://docs.particular.net/nservicebus/operations/auditing" target="_blank">message auditing <FAIcon :icon="faExternalLink" /></a>
            </div>
          </div>
          <div class="col-12" v-if="isMassTransitConnected">
            <div class="alert alert-info">MassTransit endpoints currently do not report when a pending retry has succeeded, and therefore any messages associated with those endpoints will need to be manually marked as resolved.</div>
          </div>
        </div>
        <div class="row">
          <div class="col-6">
            <div class="filter-input">
              <div class="input-group mb-3">
                <label class="input-group-text"><FAIcon :icon="faFilter" size="sm" class="icon" /> <span class="hidden-xs">Filter</span></label>
                <select class="form-select" id="inputGroupSelect01" onchange="this.dataset.chosen = true" @change="store.refresh()" v-model="selectedQueue">
                  <option selected disabled hidden class="placeholder" value="empty">Select a queue...</option>
                  <option v-for="(endpoint, index) in endpoints" :key="index" :value="endpoint">
                    {{ endpoint }}
                  </option>
                </select>
                <span class="input-group-btn">
                  <ActionButton @click="store.clearSelectedQueue()" :icon="faTimes" />
                </span>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="msg-group-menu dropdown">
              <label class="control-label">Period:</label>
              <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {{ selectedPeriod }}
                <span class="caret"></span>
              </button>
              <ul class="dropdown-menu">
                <li v-for="(period, index) in store.retryPeriodOptions" :key="index">
                  <a @click.prevent="periodChanged(period)">{{ period }}</a>
                </li>
              </ul>
            </div>
            <OrderBy @sort-updated="sortGroups" :hideGroupBy="true" :sortOptions="sortOptions" sortSavePrefix="pending_retries"></OrderBy>
          </div>
        </div>
        <div class="row">
          <div class="col-6 col-xs-12 toolbar-menus">
            <div class="action-btns">
              <ActionButton :icon="faArrowRightRotate" :disabled="!isAnythingSelected()" @click="showConfirmRetry = true"><span>Retry</span> ({{ numberSelected() }})</ActionButton>
              <ActionButton :icon="faCheckSquare" :disabled="!isAnythingSelected()" @click="showConfirmResolve = true"><span>Mark as resolved</span> ({{ numberSelected() }})</ActionButton>
              <ActionButton :icon="faArrowRightRotate" :disabled="!isAnythingDisplayed()" @click="retryAllClicked()"><span>Retry all</span></ActionButton>
              <ActionButton :icon="faCheckSquare" @click="showConfirmResolveAll = true"><span>Mark all as resolved</span></ActionButton>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <MessageList :messages="messages" ref="messageList"></MessageList>
          </div>
        </div>
        <div class="row">
          <PaginationStrip v-model="pageNumber" :total-count="totalCount" :items-per-page="store.perPage" />
        </div>
        <Teleport to="#modalDisplay">
          <ConfirmDialog
            v-if="showConfirmRetry === true"
            @cancel="showConfirmRetry = false"
            @confirm="
              showConfirmRetry = false;
              retrySelectedMessages();
            "
            :heading="'Are you sure you want to retry the selected messages?'"
            :body="'Ensure that the selected messages were not processed previously as this will create a duplicate message.'"
            :second-paragraph="'NOTE: If the selection includes messages to be processed via unaudited endpoints, those messages will need to be marked as resolved once the retry is manually verified'"
          ></ConfirmDialog>

          <ConfirmDialog
            v-if="showConfirmResolve === true"
            @cancel="showConfirmResolve = false"
            @confirm="
              showConfirmResolve = false;
              resolveSelectedMessages();
            "
            :heading="'Are you sure you want to mark as resolved the selected messages?'"
            :body="`If you mark these messages as resolved they will not be available for Retry. Messages should only be marked as resolved only if they belong to unaudited endpoints.`"
          ></ConfirmDialog>

          <ConfirmDialog
            v-if="showConfirmResolveAll === true"
            @cancel="showConfirmResolveAll = false"
            @confirm="
              showConfirmResolveAll = false;
              resolveAllMessages();
            "
            :heading="'Are you sure you want to resolve all messages?'"
            :body="`Are you sure you want to mark all ${numberDisplayed()} messages as resolved? If you do they will not be available for Retry.`"
          ></ConfirmDialog>

          <ConfirmDialog
            v-if="showCantRetryAll === true"
            @cancel="showCantRetryAll = false"
            @confirm="showCantRetryAll = false"
            :hide-cancel="true"
            :heading="'Select a queue first'"
            :body="'Bulk retry of messages can only be done for one queue at the time to avoid producing unwanted message duplicates.'"
          ></ConfirmDialog>

          <ConfirmDialog
            v-if="showRetryAllConfirm === true"
            @cancel="showRetryAllConfirm = false"
            @confirm="
              showRetryAllConfirm = false;
              retryAllMessages();
            "
            :heading="'Confirm retry of all messages?'"
            :body="'Are you sure you want to retry all previously retried messages? If the selected messages were processed in the meanwhile, then duplicate messages will be produced.'"
          ></ConfirmDialog>
        </Teleport>
      </section>
    </LicenseNotExpired>
  </ServiceControlAvailable>
</template>

<style scoped>
@import "../list.css";

.input-group-text {
  margin-bottom: 0;
}

.input-group-text > span {
  font-size: 14px;
  color: #555;
}

.input-group > select {
  font-size: 14px;
  color: #777777;
}

.input-group > select[data-chosen="true"] {
  color: #212529;
}

.input-group > select:hover {
  box-shadow: 0 0 10px 100px var(--bs-btn-hover-bg) inset;
  color: #212529;
}

.input-group-btn:last-child > .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.action-btns > .btn {
  margin-right: 5px;
}

.dropdown-toggle.btn-default:hover {
  background: none;
  border: none;
  color: var(--sp-blue);
}

.icon {
  color: var(--reduced-emphasis);
  padding-right: 6px;
}

.icon.info {
  color: #31708f;
}
</style>
