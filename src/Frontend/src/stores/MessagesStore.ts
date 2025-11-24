import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import { computed, ref, watch, shallowReadonly } from "vue";
import { useServiceControlStore } from "./ServiceControlStore";
import { useCookies } from "vue3-cookies";
import { useRoute } from "vue-router";
import { ExtendedFailedMessage, FailedMessageStatus } from "@/resources/FailedMessage";
import { SortDirection } from "@/resources/SortOptions";
import moment from "moment";
import { useConfigurationStore } from "./ConfigurationStore";
import FailureGroup from "@/resources/FailureGroup";
import QueueAddress from "@/resources/QueueAddress";

const deletedPeriodOptions = ["All Deleted", "Deleted in the last 2 Hours", "Deleted in the last 1 Day", "Deleted in the last 7 days"] as const;
const retryPeriodOptions = ["All Pending Retries", "Retried in the last 2 Hours", "Retried in the last 1 Day", "Retried in the last 7 Days"];
export type DeletedPeriodOption = (typeof deletedPeriodOptions)[number];
export type RetryPeriodOption = (typeof retryPeriodOptions)[number];

export const useMessagesStore = defineStore("MessagesStore", () => {
  const route = useRoute();
  const groupId = ref<string>(route.params.groupId as string);
  const groupName = ref("");
  const pageNumber = ref(1);
  const totalCount = ref(0);
  const messages = ref<ExtendedFailedMessage[]>([]);
  let messageStatus: FailedMessageStatus | null = null;
  const perPage = 50;
  const sortBy = ref<string>("");
  const sortDirection = ref<SortDirection>(SortDirection.Descending);
  const startDate = ref(new Date(0));
  const endDate = ref(new Date());
  const dateRange = computed(() => `${startDate.value.toISOString()}...${endDate.value.toISOString()}`);
  const selectedPeriod = ref<DeletedPeriodOption | RetryPeriodOption>("Deleted in the last 7 days");
  const selectedQueue = ref("empty");
  const endpoints = ref<string[]>([]);

  const serviceControlStore = useServiceControlStore();
  const configurationStore = useConfigurationStore();
  const { configuration } = storeToRefs(configurationStore);

  const cookies = useCookies();

  watch(pageNumber, () => refresh());

  let controller: AbortController | null;
  async function refresh() {
    try {
      if (!messageStatus) return;
      if (messageStatus === FailedMessageStatus.Archived || messageStatus === FailedMessageStatus.RetryIssued) {
        endDate.value = new Date();
        const newStartDate = new Date();

        switch (selectedPeriod.value) {
          case "All Deleted":
          case "All Pending Retries":
            newStartDate.setHours(newStartDate.getHours() - 24 * 365);
            break;
          case "Deleted in the last 2 Hours":
          case "Retried in the last 2 Hours":
            newStartDate.setHours(newStartDate.getHours() - 2);
            break;
          case "Deleted in the last 1 Day":
          case "Retried in the last 1 Day":
            newStartDate.setHours(newStartDate.getHours() - 24);
            break;
          case "Deleted in the last 7 days":
          case "Retried in the last 7 Days":
            newStartDate.setHours(newStartDate.getHours() - 24 * 7);
            break;
        }
        startDate.value = newStartDate;
      }
      const additionalQuery = (() => {
        switch (messageStatus) {
          case FailedMessageStatus.Archived:
            return `&modified=${dateRange.value}`;
          case FailedMessageStatus.RetryIssued: {
            const searchPhrase = selectedQueue.value === "empty" ? "" : selectedQueue.value;
            return `&queueaddress=${searchPhrase}&modified=${dateRange.value}`;
          }
          default:
            return "";
        }
      })();

      controller = new AbortController();
      if (groupId.value && !groupName.value) loadGroupDetails(groupId.value);
      const [response, data] = await serviceControlStore.fetchTypedFromServiceControl<ExtendedFailedMessage[]>(
        `${groupId.value ? `recoverability/groups/${groupId.value}/` : ""}errors?status=${messageStatus}&page=${pageNumber.value}&per_page=${perPage}&sort=${sortBy.value}&direction=${sortDirection.value}${additionalQuery}`,
        controller.signal
      );
      controller = null;

      totalCount.value = parseInt(response.headers.get("Total-Count") ?? "0");

      if (messages.value.length && data.length) {
        // merge the previously selected messages into the new list so we can replace them
        messages.value.forEach((previousMessage) => {
          const receivedMessage = data.find((m) => m.id === previousMessage.id);
          if (receivedMessage) {
            if (previousMessage.last_modified === receivedMessage.last_modified) {
              receivedMessage.retryInProgress = previousMessage.retryInProgress;
              receivedMessage.deleteInProgress = previousMessage.deleteInProgress;
              receivedMessage.submittedForRetrial = previousMessage.submittedForRetrial;
              receivedMessage.resolved = previousMessage.resolved;
            }

            receivedMessage.selected = previousMessage.selected;
          }
        });
      }
      messages.value = updateMessages(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadGroupDetails(groupId: string) {
    const [, data] = await serviceControlStore.fetchTypedFromServiceControl<FailureGroup>(`${messageStatus === FailedMessageStatus.Archived ? "archive" : "recoverability"}/groups/id/${groupId}`, controller?.signal);
    groupName.value = data.title;
  }

  function updateMessages(messages: ExtendedFailedMessage[]) {
    switch (messageStatus) {
      case FailedMessageStatus.Archived:
        //check deletion time
        messages.forEach((message) => {
          message.error_retention_period = moment.duration(configuration.value?.data_retention.error_retention_period).asHours();
          const countdown = moment(message.last_modified).add(message.error_retention_period, "hours");
          message.delete_soon = countdown < moment();
          message.deleted_in = countdown.format();
        });
        return messages;
      default:
        return messages;
    }
  }

  async function setMessageStatus(status: FailedMessageStatus) {
    if (controller) {
      // need to cancel any existing fetch which otherwise will set messages of the incorrect status
      controller.abort();
    }
    messageStatus = status;
    messages.value = [];
    //reset all the paging variables
    switch (messageStatus) {
      case FailedMessageStatus.Archived: {
        sortBy.value = "";
        let deletedMessagePeriod = cookies.cookies.get("all_deleted_messages_period") as DeletedPeriodOption;
        if (!deletedMessagePeriod) {
          deletedMessagePeriod = deletedPeriodOptions[deletedPeriodOptions.length - 1]; //default is last 7 days
        }
        selectedPeriod.value = deletedMessagePeriod;
        break;
      }
      case FailedMessageStatus.RetryIssued:
        {
          sortBy.value = "time_of_failure";
          let retryMessagePeriod = cookies.cookies.get("pending_retries_period");
          if (!retryMessagePeriod) {
            retryMessagePeriod = retryPeriodOptions[0]; //default All Pending Retries
          }
          selectedPeriod.value = retryMessagePeriod;
          const [, data] = await serviceControlStore.fetchTypedFromServiceControl<QueueAddress[]>("errors/queues/addresses");
          endpoints.value = data.map((endpoint) => endpoint.physical_address);
        }
        break;
      default:
        sortBy.value = "time_of_failure";
    }

    groupId.value = route.params.groupId as string;

    await refresh();
  }

  async function setSort(sort: string, direction?: SortDirection) {
    if (controller) {
      // need to cancel any existing fetch which otherwise will set messages of the incorrect sort
      controller.abort();
    }
    sortBy.value = sort;
    sortDirection.value = direction ?? SortDirection.Descending;
    messages.value = [];
    await refresh();
  }

  async function setPeriod(period: DeletedPeriodOption | RetryPeriodOption) {
    if (controller) {
      // need to cancel any existing fetch which otherwise will set messages of the incorrect period
      controller.abort();
    }
    selectedPeriod.value = period;
    cookies.cookies.set(messageStatus === FailedMessageStatus.Archived ? "all_deleted_messages_period" : "pending_retries_period", period);
    messages.value = [];
    await refresh();
  }

  async function deleteById(ids: string[]) {
    await serviceControlStore.patchToServiceControl("errors/archive", ids);
  }

  async function restoreById(ids: string[]) {
    await serviceControlStore.patchToServiceControl("errors/unarchive", ids);
  }

  async function retryById(ids: string[]) {
    await serviceControlStore.postToServiceControl("pendingretries/retry", ids);
  }

  async function resolveById(ids: string[]) {
    await serviceControlStore.patchToServiceControl("pendingretries/resolve", { uniquemessageids: ids });
  }

  async function retryAll() {
    let url = "pendingretries/retry";
    const data: { from: string; to: string; queueaddress?: string } = {
      from: new Date(0).toISOString(),
      to: new Date(0).toISOString(),
    };
    if (selectedQueue.value !== "empty") {
      url = "pendingretries/queues/retry";
      data.queueaddress = selectedQueue.value;
    }

    await serviceControlStore.postToServiceControl(url, data);
  }

  async function resolveAll() {
    await serviceControlStore.patchToServiceControl("pendingretries/resolve", { from: new Date(0).toISOString(), to: new Date().toISOString() });
  }

  async function clearSelectedQueue() {
    selectedQueue.value = "empty";
    await refresh();
  }

  return {
    refresh,
    messages,
    perPage,
    pageNumber,
    totalCount,
    groupId,
    groupName,
    sortDirection,
    deletedPeriodOptions,
    retryPeriodOptions,
    selectedPeriod,
    selectedQueue: shallowReadonly(selectedQueue),
    endpoints: shallowReadonly(endpoints),
    setSort,
    setPeriod,
    setMessageStatus,
    deleteById,
    restoreById,
    retryById,
    resolveById,
    retryAll,
    resolveAll,
    clearSelectedQueue,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessagesStore, import.meta.hot));
}

export type MessagesStore = ReturnType<typeof useMessagesStore>;
