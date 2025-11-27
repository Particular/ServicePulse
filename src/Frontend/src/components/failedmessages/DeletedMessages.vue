<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useShowToast } from "../../composables/toast";
import { onBeforeRouteLeave } from "vue-router";
import LicenseNotExpired from "../../components/LicenseNotExpired.vue";
import ServiceControlAvailable from "../ServiceControlAvailable.vue";
import MessageList, { IMessageList } from "./MessageList.vue";
import ConfirmDialog from "../ConfirmDialog.vue";
import PaginationStrip from "../../components/PaginationStrip.vue";
import { FailedMessageStatus } from "@/resources/FailedMessage";
import { TYPE } from "vue-toastification";
import FAIcon from "@/components/FAIcon.vue";
import { faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import { storeToRefs } from "pinia";
import { useStoreAutoRefresh } from "@/composables/useAutoRefresh";
import { DeletedPeriodOption, useRecoverabilityStore } from "@/stores/RecoverabilityStore";
import LoadingSpinner from "../LoadingSpinner.vue";

const POLLING_INTERVAL_NORMAL = 5000;
const POLLING_INTERVAL_FAST = 1000;

const loading = ref(false);
const { autoRefresh, isRefreshing, updateInterval } = useStoreAutoRefresh("messagesStore", useRecoverabilityStore, POLLING_INTERVAL_NORMAL);
const { store } = autoRefresh();
const { messages, groupId, groupName, totalCount, pageNumber, selectedPeriod } = storeToRefs(store);

const showConfirmRestore = ref(false);
const messageList = ref<IMessageList | undefined>();

function numberSelected() {
  return messageList.value?.getSelectedMessages()?.length ?? 0;
}

function selectAll() {
  messageList.value?.selectAll();
}

function deselectAll() {
  messageList.value?.deselectAll();
}

function isAnythingSelected() {
  return messageList.value?.isAnythingSelected();
}

async function restoreSelectedMessages() {
  // We're starting a restore, poll more frequently
  updateInterval(POLLING_INTERVAL_FAST);
  const selectedMessages = messageList.value?.getSelectedMessages() ?? [];
  selectedMessages.forEach((m) => (m.restoreInProgress = true));
  useShowToast(TYPE.INFO, "Info", `restoring ${selectedMessages.length} messages...`);

  await store.restoreById(selectedMessages.map((m) => m.id));
  messageList.value?.deselectAll();
}

async function periodChanged(period: DeletedPeriodOption) {
  loading.value = true;
  await store.setPeriod(period);
  loading.value = false;
}

onBeforeRouteLeave(() => {
  groupId.value = "";
  groupName.value = "";
});

const isRestoreInProgress = computed(() => messages.value.some((message) => message.restoreInProgress));
watch(isRestoreInProgress, (restoreInProgress) => {
  if (restoreInProgress) {
    // If there is a restore in progress, poll every 1 second
    updateInterval(POLLING_INTERVAL_FAST);
  } else {
    // If all restores are done, change polling frequency back to every 5 seconds
    updateInterval(POLLING_INTERVAL_NORMAL);
  }
});

onMounted(async () => {
  loading.value = true;
  await store.setMessageStatus(FailedMessageStatus.Archived);
  loading.value = false;
});
</script>

<template>
  <ServiceControlAvailable>
    <LicenseNotExpired>
      <section name="message_groups">
        <div class="row" v-if="groupName && messages.length > 0">
          <div class="col-sm-12">
            <h1 v-if="groupName" class="active break group-title">
              {{ groupName }}
            </h1>
            <h3 class="active group-title group-message-count">{{ totalCount }} messages in group</h3>
          </div>
        </div>
        <div class="row">
          <div class="col-9">
            <div class="btn-toolbar">
              <button type="button" class="btn btn-default select-all" @click="selectAll" v-if="!isAnythingSelected()">Select all</button>
              <button type="button" class="btn btn-default select-all" @click="deselectAll" v-if="isAnythingSelected()">Clear selection</button>
              <button type="button" class="btn btn-default" @click="showConfirmRestore = true" :disabled="!isAnythingSelected()"><FAIcon :icon="faArrowRotateRight" class="icon" /> Restore {{ numberSelected() }} selected</button>
            </div>
          </div>
          <div class="col-3">
            <div class="msg-group-menu dropdown">
              <label class="control-label">Show:</label>
              <button type="button" class="btn btn-default dropdown-toggle sp-btn-menu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {{ selectedPeriod }}
                <span class="caret"></span>
              </button>
              <ul class="dropdown-menu">
                <li v-for="(period, index) in store.deletedPeriodOptions" :key="index">
                  <a @click.prevent="periodChanged(period)">{{ period }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <LoadingSpinner v-if="messages.length === 0 && (loading || isRefreshing)" />
            <MessageList v-else :messages="messages" ref="messageList"></MessageList>
          </div>
        </div>
        <div class="row" v-if="messages.length > 0">
          <PaginationStrip v-model="pageNumber" :total-count="totalCount" :items-per-page="store.perPage" />
        </div>
        <Teleport to="#modalDisplay">
          <ConfirmDialog
            v-if="showConfirmRestore"
            @cancel="showConfirmRestore = false"
            @confirm="
              showConfirmRestore = false;
              restoreSelectedMessages();
            "
            :heading="'Are you sure you want to restore the selected messages?'"
            :body="'Restored messages will be moved back to the list of failed messages.'"
          ></ConfirmDialog>
        </Teleport>
      </section>
    </LicenseNotExpired>
  </ServiceControlAvailable>
</template>

<style scoped>
.dropdown > button:hover {
  background: none;
  border: none;
  color: var(--sp-blue);
  text-decoration: underline;
}

.icon {
  color: var(--reduced-emphasis);
}
</style>
